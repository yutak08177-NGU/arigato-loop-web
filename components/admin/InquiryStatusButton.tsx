'use client'

import { useTransition } from 'react'
import { updateInquiryStatus } from '@/app/admin/(protected)/actions'

type Status = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

const nextStatus: Record<Status, Status> = {
  OPEN: 'IN_PROGRESS',
  IN_PROGRESS: 'CLOSED',
  CLOSED: 'OPEN',
}

const nextLabel: Record<Status, string> = {
  OPEN: '対応中へ',
  IN_PROGRESS: '完了へ',
  CLOSED: '再オープン',
}

interface InquiryStatusButtonProps {
  inquiryId: number
  currentStatus: Status
}

export default function InquiryStatusButton({
  inquiryId,
  currentStatus,
}: InquiryStatusButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const next = nextStatus[currentStatus]
    startTransition(async () => {
      await updateInquiryStatus(inquiryId, next)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {isPending ? '更新中…' : nextLabel[currentStatus]}
    </button>
  )
}
