import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const PAGE_SIZE = 50

interface SearchParams {
  action_type?: string
  user_id?: string
  from?: string
  to?: string
  page?: string
}

export default async function ActionLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const actionType = params.action_type ?? ''
  const userId = params.user_id ?? ''
  const from = params.from ?? ''
  const to = params.to ?? ''
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('action_logs')
    .select(
      `
      log_id,
      user_id,
      action_type,
      device_info,
      metadata,
      created_at,
      users!action_logs_user_id_fkey(nickname)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (actionType) query = query.eq('action_type', actionType)
  if (userId) query = query.eq('user_id', parseInt(userId, 10))
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', `${to}T23:59:59`)

  const { data: logs, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Partial<SearchParams & { page: string }>) {
    const sp = new URLSearchParams()
    const merged = {
      action_type: actionType,
      user_id: userId,
      from,
      to,
      page: String(page),
      ...overrides,
    }
    if (merged.action_type) sp.set('action_type', merged.action_type)
    if (merged.user_id) sp.set('user_id', merged.user_id)
    if (merged.from) sp.set('from', merged.from)
    if (merged.to) sp.set('to', merged.to)
    if (merged.page && merged.page !== '1') sp.set('page', merged.page)
    const qs = sp.toString()
    return `/admin/logs/action${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">操作ログ</h1>

      {/* Filters */}
      <form method="GET" className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          name="action_type"
          defaultValue={actionType}
          placeholder="アクションタイプ"
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="text"
          name="user_id"
          defaultValue={userId}
          placeholder="ユーザーID"
          className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          type="submit"
          className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          絞り込む
        </button>
        <Link
          href="/admin/logs/action"
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          クリア
        </Link>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ログID</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ユーザーID</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ニックネーム</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">アクション</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">デバイス</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">メタデータ</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">日時</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const userRow = Array.isArray(log.users) ? log.users[0] : log.users
                const nickname = userRow?.nickname ?? '—'
                const metaStr = log.metadata
                  ? JSON.stringify(log.metadata).slice(0, 80)
                  : '—'
                return (
                  <tr key={log.log_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">{log.log_id}</td>
                    <td className="py-3 px-4 text-sm">
                      {log.user_id ? (
                        <Link
                          href={`/admin/users/${log.user_id}`}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {log.user_id}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{nickname}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{log.action_type}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.device_info ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 font-mono max-w-xs">
                      {log.metadata ? (
                        <details>
                          <summary className="cursor-pointer text-gray-400 hover:text-gray-600">
                            {metaStr.length >= 80 ? `${metaStr}…` : metaStr}
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-xs">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                      {log.created_at
                        ? log.created_at.replace('T', ' ').split('.')[0]
                        : '—'}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  ログが見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            全 {count?.toLocaleString()} 件 / {page} / {totalPages} ページ
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                前へ
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                次へ
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
