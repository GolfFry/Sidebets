export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-fairway-700 mb-2">⛳ GolfSettled</h1>
        <p className="text-gray-500 text-sm">Track bets, not payments</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button className="btn-primary w-full">Start a Match</button>
        <button className="btn-secondary w-full">Join a Match</button>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        <div><div className="text-2xl mb-1">🏆</div><div className="text-xs text-gray-500">Nassau</div></div>
        <div><div className="text-2xl mb-1">💰</div><div className="text-xs text-gray-500">Skins</div></div>
        <div><div className="text-2xl mb-1">📊</div><div className="text-xs text-gray-500">Ledger</div></div>
      </div>

      <footer className="mt-auto pt-8 text-center">
        <p className="text-xs text-gray-400">v0.1.0 — MVP Setup</p>
        <p className="text-xs text-gray-400 mt-1">No real money handled</p>
      </footer>
    </div>
  )
}
