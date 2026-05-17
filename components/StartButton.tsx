"use client";

import { useState } from "react";

// TODO: アプリリリース後に実際のURLへ差し替え
const APP_STORE_URL = "https://apps.apple.com/app/id000000000";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.eienloop.arigatoloop";

type Props = {
  userId: string;
  token: string;
  isIOS?: boolean;
  isAndroid?: boolean;
  variant?: "header" | "primary";
};

export default function StartButton({
  userId,
  token,
  variant = "primary",
}: Props) {
  const [open, setOpen] = useState(false);

  const qs = `?ref=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
  const appStoreUrl = `${APP_STORE_URL}${qs}`;
  const playStoreUrl = `${PLAY_STORE_URL}${qs}`;

  const btnClass =
    variant === "header"
      ? "bg-[#E07048] text-white text-sm font-medium px-5 py-2 rounded-full whitespace-nowrap"
      : "border border-[#E07048] text-[#E07048] text-sm font-medium px-10 py-3 rounded-full";

  const label =
    variant === "header" ? "はじめる" : "arigatoloopをはじめる";

  return (
    <>
      <button onClick={() => setOpen(true)} className={btnClass}>
        {label}
      </button>

      {open && (
        <AppDownloadModal
          appStoreUrl={appStoreUrl}
          playStoreUrl={playStoreUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function AppDownloadModal({
  appStoreUrl,
  playStoreUrl,
  onClose,
}: {
  appStoreUrl: string;
  playStoreUrl: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm py-10 px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* アプリアイコン */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#F0946A] flex items-center justify-center shadow-sm">
            <span className="text-white text-3xl">❤</span>
          </div>
        </div>

        {/* ロゴ */}
        <p className="text-center text-[#E07048] text-xl mb-1 leading-none">
          <span className="italic font-semibold">arigato</span>loop
        </p>

        {/* タグライン */}
        <p className="text-center text-gray-400 text-xs mb-8">
          感謝で、つながる。ポジティブな輪へようこそ
        </p>

        {/* ログインラベル */}
        <p className="text-center text-gray-500 text-sm mb-3">ログイン</p>

        {/* Apple で続ける */}
        <a
          href={appStoreUrl}
          className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-3.5 mb-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <AppleIcon />
          Apple で続ける
        </a>

        {/* Google で続ける */}
        <a
          href={playStoreUrl}
          className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-3.5 mb-8 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <GoogleIcon />
          Google で続ける
        </a>

        {/* 免責文 */}
        <p className="text-center text-gray-400 text-[11px] leading-5 px-2">
          ログインすることで、
          <span className="text-[#E07048]">
            利用規約とプライバシーポリシー
          </span>
          に同意いただきます。
        </p>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 814 1000"
      className="w-4 h-4 flex-shrink-0"
      fill="currentColor"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.5 0 663 0 541.8c0-207.5 133.4-317.1 264.4-317.1 70 0 128.1 45.2 172.2 45.2 42.2 0 109.2-47.6 187.5-47.6 30.3 0 108.2 2.6 164.5 96.3zm-79.7-216.5c37.5-44.5 64.7-106.5 64.7-168.5 0-8.7-.6-17.4-2-25.4-61.4 2.3-134.8 41.2-178.2 92.8-32.6 36.8-62.2 98.8-62.2 161.6 0 9.4 1.3 18.8 2 22.4 3.9.6 10.3 1.3 16.6 1.3 55.2 0 124.4-36.8 159.1-84.2z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
