import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchPageContent, computeDiff } from '@/lib/checker'

export const maxDuration = 300

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch pages due for a check
  const { data: pages, error } = await supabase
    .from('monitored_pages')
    .select('*')
    .eq('status', 'active')
    .lte('next_check_at', new Date().toISOString())
    .limit(20)

  if (error || !pages) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }

  const results = await Promise.allSettled(pages.map(page => checkPage(supabase, page)))

  const summary = results.map((r, i) => ({
    page: pages[i].name,
    status: r.status,
    value: r.status === 'fulfilled' ? r.value : String((r as any).reason),
  }))

  return NextResponse.json({ checked: pages.length, results: summary })
}

async function checkPage(supabase: ReturnType<typeof createAdminClient>, page: any) {
  const now = new Date()

  // Calculate next check time
  const nextCheckMap: Record<string, number> = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
  }
  const nextCheck = new Date(now.getTime() + (nextCheckMap[page.check_frequency] || nextCheckMap.daily))

  const result = await fetchPageContent(page.url, page.css_selector)

  if (!result.success) {
    await supabase.from('monitored_pages').update({
      status: 'error',
      error_message: result.error,
      last_checked_at: now.toISOString(),
      next_check_at: nextCheck.toISOString(),
      check_count: page.check_count + 1,
    }).eq('id', page.id)
    return `error: ${result.error}`
  }

  // Check if content changed
  const hasChanged = result.contentHash !== page.content_hash
  const isFirstCheck = !page.content_hash

  // Save snapshot
  const { data: snapshot } = await supabase
    .from('page_snapshots')
    .insert({
      page_id: page.id,
      content_hash: result.contentHash,
      content_text: result.contentText,
      content_length: result.contentLength,
    })
    .select()
    .single()

  if (hasChanged && !isFirstCheck && snapshot) {
    // Compute diff
    const { data: oldSnapshot } = await supabase
      .from('page_snapshots')
      .select('content_text')
      .eq('page_id', page.id)
      .neq('id', snapshot.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { diffSummary, linesAdded, linesRemoved } = computeDiff(
      oldSnapshot?.content_text || '',
      result.contentText || ''
    )

    // Record change
    await supabase.from('page_changes').insert({
      page_id: page.id,
      new_snapshot_id: snapshot.id,
      diff_summary: diffSummary,
      lines_added: linesAdded,
      lines_removed: linesRemoved,
      status: 'unread',
      detected_at: now.toISOString(),
    })

    // Send alerts
    await sendAlerts(supabase, page, diffSummary)
  }

  // Update page
  await supabase.from('monitored_pages').update({
    content_hash: result.contentHash,
    last_checked_at: now.toISOString(),
    last_changed_at: hasChanged && !isFirstCheck ? now.toISOString() : page.last_changed_at,
    next_check_at: nextCheck.toISOString(),
    check_count: page.check_count + 1,
    change_count: hasChanged && !isFirstCheck ? page.change_count + 1 : page.change_count,
    status: 'active',
    error_message: null,
  }).eq('id', page.id)

  return hasChanged && !isFirstCheck ? 'changed' : 'no-change'
}

async function sendAlerts(supabase: ReturnType<typeof createAdminClient>, page: any, diffSummary: string) {
  const { data: alerts } = await supabase
    .from('alert_configs')
    .select('*')
    .eq('user_id', page.user_id)
    .eq('is_active', true)

  if (!alerts || alerts.length === 0) return

  for (const alert of alerts) {
    if (alert.type === 'webhook' && alert.webhook_url) {
      try {
        await fetch(alert.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'page_changed',
            page: { id: page.id, name: page.name, url: page.url },
            diff_summary: diffSummary,
            detected_at: new Date().toISOString(),
          }),
        })
      } catch {}
    }
    // Email alerts would use a transactional email service in production
    // For now we store the change in DB which the user sees in dashboard
  }
}
