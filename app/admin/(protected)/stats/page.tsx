import { createSupabaseServerClient } from '@/lib/supabase-server'

function getTodayJstStart() {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const dateStr = jstNow.toISOString().split('T')[0]
  return `${dateStr}T00:00:00.000+09:00`
}

function getMonthJstStart() {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const year = jstNow.getUTCFullYear()
  const month = String(jstNow.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01T00:00:00.000+09:00`
}

function get30DaysAgoStart() {
  const d = new Date()
  d.setDate(d.getDate() - 29)
  return d.toISOString().split('T')[0] + 'T00:00:00.000Z'
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value.toLocaleString()}</span>
    </div>
  )
}

interface DailyRow {
  date: string
  count: number
}

function DailyTable({ rows, label }: { rows: DailyRow[]; label: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 mt-2">データなし</p>
  }
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 font-medium mb-2">{label} (直近30日)</div>
      <div className="overflow-auto max-h-64">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2 px-3 text-left text-xs text-gray-500 uppercase">日付</th>
              <th className="py-2 px-3 text-right text-xs text-gray-500 uppercase">件数</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date} className="border-b border-gray-100">
                <td className="py-2 px-3 text-sm text-gray-600">{row.date}</td>
                <td className="py-2 px-3 text-sm text-gray-900 text-right font-medium">
                  {row.count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function StatsPage() {
  const supabase = await createSupabaseServerClient()
  const todayStart = getTodayJstStart()
  const monthStart = getMonthJstStart()
  const thirtyDaysAgo = get30DaysAgoStart()

  // ---- User stats ----
  const [
    { count: totalUsers },
    { count: dau },
    { count: mauUsers },
    { data: dailyNewUsersRaw },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    supabase
      .from('action_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action_type', 'LOGIN')
      .gte('created_at', todayStart),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', monthStart),
    supabase
      .from('users')
      .select('created_at')
      .eq('is_deleted', false)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
  ])

  // Aggregate daily new users
  const dailyNewUsersMap: Record<string, number> = {}
  for (const u of dailyNewUsersRaw ?? []) {
    const date = u.created_at.split('T')[0]
    dailyNewUsersMap[date] = (dailyNewUsersMap[date] ?? 0) + 1
  }
  const dailyNewUsers: DailyRow[] = Object.entries(dailyNewUsersMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))

  // ---- Arigatou stats ----
  const [
    { count: totalArigatou },
    { count: todayArigatou },
    { count: monthArigatou },
    { data: dailyArigatouRaw },
  ] = await Promise.all([
    supabase
      .from('arigatou')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    supabase
      .from('arigatou')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', todayStart),
    supabase
      .from('arigatou')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', monthStart),
    supabase
      .from('arigatou')
      .select('created_at')
      .eq('is_deleted', false)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
  ])

  const dailyArigatouMap: Record<string, number> = {}
  for (const a of dailyArigatouRaw ?? []) {
    const date = a.created_at.split('T')[0]
    dailyArigatouMap[date] = (dailyArigatouMap[date] ?? 0) + 1
  }
  const dailyArigatou: DailyRow[] = Object.entries(dailyArigatouMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))

  // ---- Connection stats ----
  const [
    { count: totalConnections },
    { count: monthConnections },
    { data: dailyConnectionsRaw },
  ] = await Promise.all([
    supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', monthStart),
    supabase
      .from('connections')
      .select('created_at')
      .eq('is_deleted', false)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
  ])

  const dailyConnectionsMap: Record<string, number> = {}
  for (const c of dailyConnectionsRaw ?? []) {
    const date = c.created_at.split('T')[0]
    dailyConnectionsMap[date] = (dailyConnectionsMap[date] ?? 0) + 1
  }
  const dailyConnections: DailyRow[] = Object.entries(dailyConnectionsMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))

  // ---- Error stats ----
  const [{ count: todayErrors }, { data: errorsByTypeRaw }] = await Promise.all([
    supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    supabase
      .from('error_logs')
      .select('error_type, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false }),
  ])

  const errorsByTypeMap: Record<string, number> = {}
  for (const e of errorsByTypeRaw ?? []) {
    const t = e.error_type ?? '不明'
    errorsByTypeMap[t] = (errorsByTypeMap[t] ?? 0) + 1
  }
  const errorsByType: DailyRow[] = Object.entries(errorsByTypeMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">統計・分析</h1>

      {/* User stats */}
      <SectionCard title="ユーザー統計">
        <StatRow label="総ユーザー数" value={totalUsers ?? 0} />
        <StatRow label="DAU (本日ログイン)" value={dau ?? 0} />
        <StatRow label="MAU (今月の新規ユーザー)" value={mauUsers ?? 0} />
        <DailyTable rows={dailyNewUsers} label="日別新規ユーザー数" />
      </SectionCard>

      {/* Arigatou stats */}
      <SectionCard title="ありがとう統計">
        <StatRow label="累計ありがとう数" value={totalArigatou ?? 0} />
        <StatRow label="本日のありがとう数" value={todayArigatou ?? 0} />
        <StatRow label="今月のありがとう数" value={monthArigatou ?? 0} />
        <DailyTable rows={dailyArigatou} label="日別ありがとう数" />
      </SectionCard>

      {/* Connection stats */}
      <SectionCard title="つながり統計">
        <StatRow label="累計つながり数" value={totalConnections ?? 0} />
        <StatRow label="今月のつながり数" value={monthConnections ?? 0} />
        <DailyTable rows={dailyConnections} label="日別つながり数" />
      </SectionCard>

      {/* Error stats */}
      <SectionCard title="エラー統計">
        <StatRow label="本日のエラー数" value={todayErrors ?? 0} />
        {errorsByType.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 font-medium mb-2">
              エラータイプ別件数 (直近30日)
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-left text-xs text-gray-500 uppercase">エラータイプ</th>
                  <th className="py-2 px-3 text-right text-xs text-gray-500 uppercase">件数</th>
                </tr>
              </thead>
              <tbody>
                {errorsByType.map((row) => (
                  <tr key={row.date} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-sm text-gray-600">{row.date}</td>
                    <td className="py-2 px-3 text-sm text-gray-900 text-right font-medium">
                      {row.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
