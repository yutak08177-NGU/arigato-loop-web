'use client'

import { useState, useTransition } from 'react'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { freezeUser, unfreezeUser, changeUserRole, softDeleteUser } from '@/app/admin/(protected)/actions'

interface UserActionButtonsProps {
  userId: number
  nickname: string | null
  isActive: boolean
  role: string
}

type ModalType = 'freeze' | 'unfreeze' | 'make_admin' | 'make_user' | 'delete'

export default function UserActionButtons({
  userId,
  nickname,
  isActive,
  role,
}: UserActionButtonsProps) {
  const [modal, setModal] = useState<ModalType | null>(null)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function handleConfirm() {
    if (!modal) return
    startTransition(async () => {
      try {
        if (modal === 'freeze') await freezeUser(userId)
        if (modal === 'unfreeze') await unfreezeUser(userId)
        if (modal === 'make_admin') await changeUserRole(userId, 'ADMIN')
        if (modal === 'make_user') await changeUserRole(userId, 'USER')
        if (modal === 'delete') await softDeleteUser(userId)
        setFeedback({ ok: true, msg: '操作が完了しました。' })
      } catch {
        setFeedback({ ok: false, msg: '操作中にエラーが発生しました。' })
      }
      setModal(null)
    })
  }

  const displayName = nickname ?? String(userId)

  const modalConfigs: Record<
    ModalType,
    { title: string; description: string; confirmLabel: string; isDanger: boolean }
  > = {
    freeze: {
      title: 'ユーザーを凍結',
      description: `${displayName} のアカウントを凍結しますか？`,
      confirmLabel: '凍結する',
      isDanger: true,
    },
    unfreeze: {
      title: 'ユーザーを解凍',
      description: `${displayName} のアカウントを解凍しますか？`,
      confirmLabel: '解凍する',
      isDanger: false,
    },
    make_admin: {
      title: '管理者に変更',
      description: `${displayName} を管理者に変更しますか？`,
      confirmLabel: '変更する',
      isDanger: false,
    },
    make_user: {
      title: '一般ユーザーに変更',
      description: `${displayName} を一般ユーザーに変更しますか？`,
      confirmLabel: '変更する',
      isDanger: true,
    },
    delete: {
      title: 'ユーザーを削除',
      description: `${displayName} を削除します。この操作は取り消せません。`,
      confirmLabel: '削除する',
      isDanger: true,
    },
  }

  const currentModal = modal ? modalConfigs[modal] : null

  return (
    <div>
      {feedback && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            feedback.ok
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {isActive ? (
          <button
            onClick={() => setModal('freeze')}
            disabled={isPending}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            凍結する
          </button>
        ) : (
          <button
            onClick={() => setModal('unfreeze')}
            disabled={isPending}
            className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            凍結解除
          </button>
        )}

        {role === 'USER' ? (
          <button
            onClick={() => setModal('make_admin')}
            disabled={isPending}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            管理者に変更
          </button>
        ) : (
          <button
            onClick={() => setModal('make_user')}
            disabled={isPending}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            一般ユーザーに変更
          </button>
        )}

        <button
          onClick={() => setModal('delete')}
          disabled={isPending}
          className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          削除する
        </button>
      </div>

      {currentModal && (
        <ConfirmModal
          isOpen={true}
          title={currentModal.title}
          description={currentModal.description}
          confirmLabel={currentModal.confirmLabel}
          isDanger={currentModal.isDanger}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}
