import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const PAGE_SIZE = 20

interface SearchParams {
  q?: string
  filter?: string
  page?: string
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {role}
    </span>
  )
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {isActive ? 'アクティブ' : '凍結中'}
    </span>
  )
}

const filterTabs = [
  { key: 'all', label: 'すべて' },
  { key: 'active', label: 'アクティブ' },
  { key: 'frozen', label: '凍結中' },
  { key: 'admin', label: '管理者' },
]

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const filter = params.filter ?? 'all'
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('users')
    .select('user_id, last_name, first_name, nickname, role, is_active, created_at', {
      count: 'exact',
    })
    .eq('is_deleted', false)
    .order('user_id', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (q) {
    query = query.ilike('nickname', `%${q}%`)
  }

  if (filter === 'active') query = query.eq('is_active', true)
  if (filter === 'frozen') query = query.eq('is_active', false)
  if (filter === 'admin') query = query.eq('role', 'ADMIN')

  const { data: users, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Partial<SearchParams>) {
    const sp = new URLSearchParams()
    const merged = { q, filter, page: String(page), ...overrides }
    if (merged.q) sp.set('q', merged.q)
    if (merged.filter && merged.filter !== 'all') sp.set('filter', merged.filter)
    if (merged.page && merged.page !== '1') sp.set('page', merged.page)
    const qs = sp.toString()
    return `/admin/users${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">ユーザー管理</h1>

      {/* Search */}
      <form method="GET" className="mb-4 flex gap-3">
        {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="ニックネームで検索..."
          className="flex-1 max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          type="submit"
          className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          検索
        </button>
        {q && (
          <Link
            href={buildUrl({ q: '', page: '1' })}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            クリア
          </Link>
        )}
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {filterTabs.map((tab) => (
          <Link
            key={tab.key}
            href={buildUrl({ filter: tab.key, page: '1' })}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
              filter === tab.key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ID</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">氏名</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ニックネーム</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ロール</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ステータス</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">登録日</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{user.user_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {[user.last_name, user.first_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{user.nickname || '—'}</td>
                  <td className="py-3 px-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-3 px-4">
                    <ActiveBadge isActive={user.is_active} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {user.created_at ? user.created_at.split('T')[0] : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/users/${user.user_id}`}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  ユーザーが見つかりません
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
