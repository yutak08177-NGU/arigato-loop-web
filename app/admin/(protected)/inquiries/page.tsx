import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import InquiryStatusButton from '@/components/admin/InquiryStatusButton'

const PAGE_SIZE = 20

type InquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

interface SearchParams {
  status?: string
  page?: string
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const styles: Record<InquiryStatus, string> = {
    OPEN: 'bg-red-100 text-red-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    CLOSED: 'bg-green-100 text-green-700',
  }
  const labels: Record<InquiryStatus, string> = {
    OPEN: '未対応',
    IN_PROGRESS: '対応中',
    CLOSED: '完了',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    BUG: 'bg-red-100 text-red-700',
    FEATURE: 'bg-blue-100 text-blue-700',
    OTHER: 'bg-gray-100 text-gray-600',
  }
  const labels: Record<string, string> = {
    BUG: 'バグ',
    FEATURE: '機能要望',
    OTHER: 'その他',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[type] ?? type}
    </span>
  )
}

const statusTabs = [
  { key: 'all', label: 'すべて' },
  { key: 'OPEN', label: '未対応' },
  { key: 'IN_PROGRESS', label: '対応中' },
  { key: 'CLOSED', label: '完了' },
]

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('inquiry')
    .select(
      `
      inquiry_id,
      user_id,
      inquiry_type,
      content,
      email,
      status,
      created_at,
      users!inquiry_user_id_fkey(nickname)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: inquiries, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Partial<{ status: string; page: string }>) {
    const sp = new URLSearchParams()
    const merged = { status, page: String(page), ...overrides }
    if (merged.status && merged.status !== 'all') sp.set('status', merged.status)
    if (merged.page && merged.page !== '1') sp.set('page', merged.page)
    const qs = sp.toString()
    return `/admin/inquiries${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">お問い合わせ</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <Link
            key={tab.key}
            href={buildUrl({ status: tab.key, page: '1' })}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
              status === tab.key
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
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ユーザー</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">種別</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">内容</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">メール</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">ステータス</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">日時</th>
              <th className="py-3 px-4 text-left text-xs text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {inquiries && inquiries.length > 0 ? (
              inquiries.map((inquiry) => {
                const userRow = Array.isArray(inquiry.users) ? inquiry.users[0] : inquiry.users
                const nickname = userRow?.nickname ?? '—'
                const contentPreview = inquiry.content
                  ? inquiry.content.slice(0, 50) + (inquiry.content.length > 50 ? '…' : '')
                  : '—'

                return (
                  <tr key={inquiry.inquiry_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">{inquiry.inquiry_id}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="text-gray-500">{inquiry.user_id}</div>
                      <div className="text-gray-700">{nickname}</div>
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={inquiry.inquiry_type} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 max-w-xs">{contentPreview}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{inquiry.email ?? '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inquiry.status as InquiryStatus} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                      {inquiry.created_at
                        ? inquiry.created_at.replace('T', ' ').split('.')[0]
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <InquiryStatusButton
                        inquiryId={inquiry.inquiry_id}
                        currentStatus={inquiry.status as InquiryStatus}
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  お問い合わせが見つかりません
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
