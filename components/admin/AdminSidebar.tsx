'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'ダッシュボード', href: '/admin/dashboard' },
  { label: 'ユーザー管理', href: '/admin/users' },
  { label: '操作ログ', href: '/admin/logs/action' },
  { label: 'エラーログ', href: '/admin/logs/error' },
  { label: 'お問い合わせ', href: '/admin/inquiries' },
  { label: '統計・分析', href: '/admin/stats' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col"
      style={{ width: 240 }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="text-lg font-bold" style={{ color: '#E07048' }}>
          arigatoloop
        </div>
        <div className="text-xs text-gray-500 mt-0.5">管理パネル</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
