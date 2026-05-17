export default function InvalidPage() {
  return (
    <div className="min-h-screen bg-[#F3E8D8] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl mb-4">🔗</p>
      <h1 className="text-lg font-bold text-gray-800 mb-2">
        このURLは無効です
      </h1>
      <p className="text-sm text-gray-500 mb-12">
        新しいURLを共有してもらってください。
      </p>
      <p className="text-[#E07048] text-lg leading-none">
        <span className="italic font-semibold">arigato</span>loop
      </p>
    </div>
  );
}
