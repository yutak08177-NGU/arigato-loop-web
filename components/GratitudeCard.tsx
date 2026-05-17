export type Gratitude = {
  thank_id: number;
  sender_user_id: number;
  message: string;
  reaction_emoji: string | null;
  created_at: string;
  sender?: {
    user_id: number;
    last_name: string;
    first_name: string;
    avatar_url: string | null;
  };
};

const AVATAR_BG_COLORS = [
  "bg-orange-200",
  "bg-pink-200",
  "bg-sky-200",
  "bg-emerald-200",
  "bg-purple-200",
  "bg-yellow-200",
  "bg-red-200",
  "bg-indigo-200",
];

function getAvatarBg(id: number): string {
  return AVATAR_BG_COLORS[id % AVATAR_BG_COLORS.length];
}

function formatDateJP(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function GratitudeCard({
  gratitude,
}: {
  gratitude: Gratitude;
}) {
  const { sender, sender_user_id, message, reaction_emoji, created_at } =
    gratitude;

  const senderName = sender
    ? `${sender.last_name} ${sender.first_name}`
    : "";
  const senderInitial = sender?.last_name?.[0] ?? "?";

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-4">
      {/* ヘッダー行 */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-11 h-11 rounded-full ${getAvatarBg(sender_user_id)} flex items-center justify-center flex-shrink-0 overflow-hidden`}
        >
          {sender?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sender.avatar_url}
              alt={senderName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold text-white opacity-80">
              {senderInitial}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight">
            {senderName}
          </p>
          {reaction_emoji && (
            <p className="text-base mt-0.5">{reaction_emoji}</p>
          )}
        </div>
      </div>

      {/* メッセージ */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">{message}</p>

      {/* 日付 */}
      <p className="text-gray-400 text-xs text-right">
        {formatDateJP(created_at)}
      </p>
    </div>
  );
}
