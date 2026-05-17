import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import UserActionButtons from '@/components/admin/UserActionButtons'

interface Params {
  userId: string
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-gray-100 flex gap-4">
      <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 flex-1">{value ?? '—'}</dd>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { userId } = await params
  const userIdNum = parseInt(userId, 10)

  if (isNaN(userIdNum)) notFound()

  const supabase = await createSupabaseServerClient()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userIdNum)
    .single()

  if (!user) notFound()

  // Fetch counts in parallel
  const [
    { count: sentArigatou },
    { count: receivedArigatou },
    { count: connections },
    { count: introductionsWritten },
    { count: introductionsReceived },
    { data: recentLogs },
  ] = await Promise.all([
    supabase
      .from('arigatou')
      .select('*', { count: 'exact', head: true })
      .eq('sender_user_id', userIdNum)
      .eq('is_deleted', false),
    supabase
      .from('arigatou')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_user_id', userIdNum)
      .eq('is_deleted', false),
    supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`sender_user_id.eq.${userIdNum},receiver_user_id.eq.${userIdNum}`)
      .eq('is_deleted', false),
    supabase
      .from('user_introductions')
      .select('*', { count: 'exact', head: true })
      .eq('writer_user_id', userIdNum)
      .eq('is_deleted', false),
    supabase
      .from('user_introductions')
      .select('*', { count: 'exact', head: true })
      .eq('target_user_id', userIdNum)
      .eq('is_deleted', false),
    supabase
      .from('action_logs')
      .select('log_id, action_type, device_info, metadata, created_at')
      .eq('user_id', userIdNum)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="max-w-4xl">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-700">
          ← ユーザー一覧
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        ユーザー詳細 #{user.user_id}
      </h1>

      {/* Profile */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">プロフィール情報</h2>
        <dl>
          <Field label="ユーザーID" value={user.user_id} />
          <Field label="氏名" value={[user.last_name, user.first_name].filter(Boolean).join(' ') || null} />
          <Field label="氏名（カナ）" value={[user.last_name_kana, user.first_name_kana].filter(Boolean).join(' ') || null} />
          <Field label="ニックネーム" value={user.nickname} />
          <Field label="生年月日" value={user.birth_date} />
          <Field label="性別" value={user.gender} />
          <Field label="郵便番号" value={user.postal_code} />
          <Field label="職業" value={user.job} />
          <Field label="ロール" value={user.role} />
          <Field
            label="ステータス"
            value={
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {user.is_active ? 'アクティブ' : '凍結中'}
              </span>
            }
          />
          <Field label="削除済み" value={user.is_deleted ? 'はい' : 'いいえ'} />
          <Field label="登録日" value={user.created_at ? user.created_at.split('T')[0] : null} />
          <Field label="更新日" value={user.updated_at ? user.updated_at.split('T')[0] : null} />
        </dl>
      </section>

      {/* Stats */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">統計情報</h2>
        <div className="grid grid-cols-5 gap-3">
          <StatCard label="送信ありがとう" value={sentArigatou ?? 0} />
          <StatCard label="受信ありがとう" value={receivedArigatou ?? 0} />
          <StatCard label="つながり" value={connections ?? 0} />
          <StatCard label="書いた紹介" value={introductionsWritten ?? 0} />
          <StatCard label="受けた紹介" value={introductionsReceived ?? 0} />
        </div>
      </section>

      {/* Actions */}
      {!user.is_deleted && (
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">操作</h2>
          <UserActionButtons
            userId={user.user_id}
            nickname={user.nickname}
            isActive={user.is_active}
            role={user.role}
          />
        </section>
      )}

      {/* Action logs */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">操作履歴（直近20件）</h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ログID</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">アクション</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">デバイス</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">日時</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <tr key={log.log_id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-500">{log.log_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.action_type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.device_info ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {log.created_at ? log.created_at.replace('T', ' ').split('.')[0] : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                  操作履歴がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
