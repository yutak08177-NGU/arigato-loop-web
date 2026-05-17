import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Note: startOfDay is UTC midnight, which approximates JST (UTC+9) start of day.
// For exact JST, subtract 9 hours from JST midnight to get UTC.
function getTodayUtcStart() {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const jstDateStr = jstNow.toISOString().split('T')[0]
  // JST midnight = UTC midnight - 9 hours
  return `${jstDateStr}T00:00:00.000+09:00`
}

interface StatCardProps {
  label: string
  value: number
  href: string
}

function StatCard({ label, value, href }: StatCardProps) {
  return (
    <Link href={href} className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className="text-4xl font-bold text-gray-900">{value.toLocaleString()}</div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const todayStart = getTodayUtcStart()

  const [
    { count: totalUsers },
    { count: todayNewUsers },
    { count: todayArigatou },
    { count: todayErrors },
    { count: openInquiries },
    { count: frozenUsers },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', todayStart),
    supabase
      .from('arigatou')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', todayStart),
    supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    supabase
      .from('inquiry')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPEN'),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false)
      .eq('is_deleted', false),
  ])

  const stats: StatCardProps[] = [
    { label: '総ユーザー数', value: totalUsers ?? 0, href: '/admin/users' },
    { label: '本日の新規ユーザー', value: todayNewUsers ?? 0, href: '/admin/users' },
    { label: '本日のありがとう数', value: todayArigatou ?? 0, href: '/admin/stats' },
    { label: '本日のエラー数', value: todayErrors ?? 0, href: '/admin/logs/error' },
    { label: '未対応お問い合わせ', value: openInquiries ?? 0, href: '/admin/inquiries' },
    { label: '凍結中ユーザー', value: frozenUsers ?? 0, href: '/admin/users?filter=frozen' },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  )
}
