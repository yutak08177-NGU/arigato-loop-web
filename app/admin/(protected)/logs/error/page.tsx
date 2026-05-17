import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const PAGE_SIZE = 50

interface SearchParams {
  error_type?: string
  user_id?: string
  from?: string
  to?: string
  page?: string
}

export default async function ErrorLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const errorType = params.error_type ?? ''
  const userId = params.user_id ?? ''
  const from = params.from ?? ''
  const to = params.to ?? ''
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('error_logs')
    .select(
      `
      error_log_id,
      user_id,
      error_type,
      error_message,
      stack_trace,
      created_at,
      users!error_logs_user_id_fkey(nickname)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (errorType) query = query.eq('error_type', errorType)
  if (userId) query = query.eq('user_id', parseInt(userId, 10))
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', `${to}T23:59:59`)

  const { data: logs, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Partial<SearchParams & { page: string }>) {
    const sp = new URLSearchParams()
    const merged = {
      error_type: errorType,
      user_id: userId,
      from,
      to,
      page: String(page),
      ...overrides,
    }
    if (merged.error_type) sp.set('error_type', merged.error_type)
    if (merged.user_id) sp.set('user_id', merged.user_id)
    if (merged.from) sp.set('from', merged.from)
    if (merged.to) sp.set('to', merged.to)
    if (merged.page && merged.page !== '1') sp.set('page', merged.page)
    const qs = sp.toString()
    return `/admin/logs/error${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">エラーログ</h1>

      {/* Filters */}
      <form method="GET" className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          name="error_type"
          defaultValue={errorType}
          placeholder="エラータイプ"
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
          href="/admin/logs/error"
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
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">エラータイプ</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">エラーメッセージ</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">スタックトレース</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">日時</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const userRow = Array.isArray(log.users) ? log.users[0] : log.users
                const nickname = userRow?.nickname ?? '—'
                const message = log.error_message
                  ? log.error_message.slice(0, 100) +
                    (log.error_message.length > 100 ? '…' : '')
                  : '—'
                const stackPreview = log.stack_trace
                  ? log.stack_trace.slice(0, 200)
                  : null

                return (
                  <tr key={log.error_log_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">{log.error_log_id}</td>
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
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                        {log.error_type ?? '不明'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 max-w-xs">{message}</td>
                    <td className="py-3 px-4 text-sm max-w-xs">
                      {stackPreview ? (
                        <details>
                          <summary className="cursor-pointer text-gray-400 hover:text-gray-600 text-xs">
                            表示する
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-xs whitespace-pre-wrap">
                            {stackPreview}
                            {log.stack_trace && log.stack_trace.length > 200 ? '…' : ''}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-400">—</span>
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
                  エラーログが見つかりません
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
