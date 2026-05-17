import StartButton from "./StartButton";

type User = {
  user_id: number;
  last_name: string;
  first_name: string;
  nickname: string;
  job: string;
  avatar_url: string | null;
};

type Props = {
  user: User;
  introductionCount: number;
  connectionCount: number;
  token: string;
  isIOS: boolean;
  isAndroid: boolean;
};

export default function InviteProfile({
  user,
  introductionCount,
  connectionCount,
  token,
  isIOS,
  isAndroid,
}: Props) {
  const fullName = `${user.last_name} ${user.first_name}`;
  const initial = user.last_name?.[0] ?? "?";

  return (
    <section className="flex flex-col items-center text-center px-6 pt-2 pb-8">
      {/* アバター */}
      <div className="w-24 h-24 rounded-full bg-[#EDD9C4] flex items-center justify-center mb-6 shadow-sm overflow-hidden">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-[#C4956A]">{initial}</span>
        )}
      </div>

      {/* 氏名 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-wide">
        {fullName}
      </h1>

      {/* ニックネーム */}
      <p className="text-gray-400 text-sm mb-6">@{user.nickname}</p>

      {/* 統計 */}
      <div className="flex gap-10 mb-6">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#E07048]">
            {introductionCount}
          </span>
          <span className="text-xs text-gray-500 mt-1">他己紹介</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#E07048]">
            {connectionCount}
          </span>
          <span className="text-xs text-gray-500 mt-1">つながり</span>
        </div>
      </div>

      {/* ブランド */}
      <p className="text-[#E07048] text-lg mb-3 leading-none">
        <span className="italic font-semibold">arigato</span>loop
      </p>

      {/* キャッチコピー */}
      <p className="text-gray-400 text-sm leading-7 mb-6">
        自分の強みは、自分じゃわからない。
        <br />
        だから誰かに書いてもらおう。
      </p>

      {/* CTAボタン */}
      <StartButton
        userId={String(user.user_id)}
        token={token}
        isIOS={isIOS}
        isAndroid={isAndroid}
        variant="primary"
      />

      {/* コピーライト */}
      <p className="text-gray-400 text-xs mt-5">© 2026 eienloop株式会社</p>
    </section>
  );
}
