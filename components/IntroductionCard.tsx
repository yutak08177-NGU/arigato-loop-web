export type Introduction = {
  introduction_id: number;
  writer_user_id: number;
  relationship: string;
  personality: string;
  skills: string;
  introduction_message: string;
  created_at: string;
  writer?: {
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

export default function IntroductionCard({
  introduction,
}: {
  introduction: Introduction;
}) {
  const {
    writer,
    writer_user_id,
    relationship,
    personality,
    skills,
    introduction_message,
    created_at,
  } = introduction;

  const writerName = writer
    ? `${writer.last_name} ${writer.first_name}`
    : "";
  const writerInitial = writer?.last_name?.[0] ?? "?";

  // personality を先頭タグ（「」付き）、skills をカンマ区切りで展開
  const skillTags = skills
    ? skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const tags = personality ? [personality, ...skillTags] : skillTags;

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-4">
      {/* ヘッダー行 */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-11 h-11 rounded-full ${getAvatarBg(writer_user_id)} flex items-center justify-center flex-shrink-0 overflow-hidden`}
        >
          {writer?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={writer.avatar_url}
              alt={writerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold text-white opacity-80">
              {writerInitial}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight">
            {writerName}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">{relationship}</p>
        </div>
        <span className="text-[#E07048] text-xs flex-shrink-0 mt-1">▼</span>
      </div>

      {/* タグ */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full"
            >
              {i === 0 ? `「${tag}」` : tag}
            </span>
          ))}
        </div>
      )}

      {/* 紹介メッセージ */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {introduction_message}
      </p>

      {/* 日付 */}
      <p className="text-gray-400 text-xs text-right">
        {formatDateJP(created_at)}
      </p>
    </div>
  );
}
