import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import InviteProfile from "@/components/InviteProfile";
import IntroductionCard from "@/components/IntroductionCard";
import type { Introduction } from "@/components/IntroductionCard";
import GratitudeCard from "@/components/GratitudeCard";
import type { Gratitude } from "@/components/GratitudeCard";
import StartButton from "@/components/StartButton";

type UserRow = {
  user_id: number;
  last_name: string;
  first_name: string;
  nickname: string;
  job: string;
  avatar_url: string | null;
};

type WriterRow = {
  user_id: number;
  last_name: string;
  first_name: string;
  avatar_url: string | null;
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. トークンの存在確認
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("invite_tokens")
    .select("user_id, created_at")
    .eq("token", token)
    .single();

  if (tokenError || !tokenRecord) {
    redirect("/invalid");
  }

  const userId: number = tokenRecord.user_id;

  // 2. 同一ユーザーの最新トークンと一致するか確認
  const { data: latestToken } = await supabase
    .from("invite_tokens")
    .select("token")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestToken || latestToken.token !== token) {
    redirect("/invalid");
  }

  // 3. ユーザープロフィール取得
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("user_id, last_name, first_name, nickname, job, avatar_url")
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (userError || !user) {
    notFound();
  }

  // 4. 他己紹介数（公開のみ）
  const { count: introductionCount } = await supabase
    .from("user_introductions")
    .select("*", { count: "exact", head: true })
    .eq("target_user_id", userId)
    .eq("is_public", true)
    .eq("is_deleted", false);

  // 5. つながり数
  const { count: connectionCount } = await supabase
    .from("connections")
    .select("*", { count: "exact", head: true })
    .or(`sender_user_id.eq.${userId},receiver_user_id.eq.${userId}`)
    .eq("is_deleted", false);

  // 6. 公開他己紹介を最新3件取得
  const { data: rawIntros } = await supabase
    .from("user_introductions")
    .select(
      "introduction_id, writer_user_id, relationship, personality, skills, introduction_message, created_at"
    )
    .eq("target_user_id", userId)
    .eq("is_public", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(3);

  // 7. 紹介者情報を取得
  const writerIds = [
    ...new Set((rawIntros ?? []).map((i) => i.writer_user_id)),
  ];
  const { data: writers } =
    writerIds.length > 0
      ? await supabase
          .from("users")
          .select("user_id, last_name, first_name, avatar_url")
          .in("user_id", writerIds)
      : { data: [] as WriterRow[] };

  const introductions: Introduction[] = (rawIntros ?? []).map((intro) => ({
    ...intro,
    writer: (writers ?? []).find((w) => w.user_id === intro.writer_user_id),
  }));

  // 8. 公開感謝履歴を最新3件取得
  const { data: rawGratitudes } = await supabase
    .from("arigatou")
    .select("thank_id, sender_user_id, message, reaction_emoji, created_at")
    .eq("receiver_user_id", userId)
    .eq("is_public", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(3);

  // 9. 送信者情報を取得
  const senderIds = [
    ...new Set((rawGratitudes ?? []).map((g) => g.sender_user_id)),
  ];
  const { data: senders } =
    senderIds.length > 0
      ? await supabase
          .from("users")
          .select("user_id, last_name, first_name, avatar_url")
          .in("user_id", senderIds)
      : { data: [] as WriterRow[] };

  const gratitudes: Gratitude[] = (rawGratitudes ?? []).map((g) => ({
    ...g,
    sender: (senders ?? []).find((s) => s.user_id === g.sender_user_id),
  }));

  // 10. サーバーサイドでOSを判定
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  const typedUser = user as UserRow;

  return (
    <div className="min-h-screen bg-[#F3E8D8]">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-5 py-4">
        <p className="text-[#E07048] text-lg leading-none">
          <span className="italic font-semibold">arigato</span>
          <span className="text-sm font-normal">loop</span>
        </p>
        <StartButton
          userId={String(typedUser.user_id)}
          token={token}
          isIOS={isIOS}
          isAndroid={isAndroid}
          variant="header"
        />
      </header>

      {/* プロフィール */}
      <InviteProfile
        user={typedUser}
        introductionCount={introductionCount ?? 0}
        connectionCount={connectionCount ?? 0}
        token={token}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />

      {/* 他己紹介一覧 */}
      {introductions.length > 0 && (
        <section className="px-4 pb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-sm">✏</span>
            <span className="text-sm font-medium text-gray-600">他己紹介</span>
          </div>
          <div className="space-y-4">
            {introductions.map((intro) => (
              <IntroductionCard
                key={intro.introduction_id}
                introduction={intro}
              />
            ))}
          </div>
        </section>
      )}

      {/* 感謝履歴 */}
      {gratitudes.length > 0 && (
        <section className="px-4 pb-12">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-sm">❤</span>
            <span className="text-sm font-medium text-gray-600">感謝履歴</span>
          </div>
          <div className="space-y-4">
            {gratitudes.map((g) => (
              <GratitudeCard key={g.thank_id} gratitude={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
