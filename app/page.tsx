'use client'

import { useState, useEffect } from 'react'
import ccxt from 'ccxt'

export default function FundingArbitrageBot() {
  const [mode, setMode] = useState<'testnet' | 'mainnet'>('testnet')
  const [status, setStatus] = useState('Підключення до Bybit...')
  const [fundingRates, setFundingRates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const exchange = new ccxt.bybit({
    enableRateLimit: true,
  })

  // Для Testnet
  if (mode === 'testnet') {
    exchange.setSandboxMode(true)
  }

  useEffect(() => {
    fetchFundingRates()
    
    // Оновлення кожні 30 секунд
    const interval = setInterval(fetchFundingRates, 30000)
    return () => clearInterval(interval)
  }, [mode])

  async function fetchFundingRates() {
    setLoading(true)
    try {
      setStatus(mode === 'testnet' ? '🧪 Отримання даних з Testnet...' : '🔥 Отримання даних з Mainnet...')

      const markets = await exchange.loadMarkets()
      const symbols = Object.keys(markets).filter(s => s.includes('USDT'))

      const rates = await exchange.fetchFundingRates(symbols.slice(0, 30)) // перші 30 пар

      const formatted = Object.entries(rates).map(([symbol, data]: any) => ({
        symbol: symbol.replace(':USDT', ''),
        fundingRate: (data.fundingRate * 100).toFixed(4),
        timestamp: new Date(data.timestamp).toLocaleTimeString('uk-UA'),
        predictedRate: (data.predictedFundingRate * 100 || 0).toFixed(4)
      }))

      setFundingRates(formatted.sort((a, b) => parseFloat(b.fundingRate) - parseFloat(a.fundingRate)))
      setStatus(mode === 'testnet' ? '✅ Підключено до Bybit Testnet' : '✅ Підключено до Mainnet')
    } catch (error) {
      console.error(error)
      setStatus('❌ Помилка підключення')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold flex items-center gap-4">
              🍅 CAPUSTA
              <span className="text-emerald-500 text-3xl">ARBITRAGE</span>
            </h1>
            <p className="text-xl text-gray-400 mt-1">Bybit Funding Rate Bot</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode('testnet')}
              className={`px-8 py-3 rounded-2xl font-medium transition-all ${mode === 'testnet' ? 'bg-emerald-600 shadow-lg shadow-emerald-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              🧪 Testnet
            </button>
            <button
              onClick={() => setMode('mainnet')}
              className={`px-8 py-3 rounded-2xl font-medium transition-all ${mode === 'mainnet' ? 'bg-red-600 shadow-lg shadow-red-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              🔥 Mainnet
            </button>
          </div>
        </header>

        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Funding Rates (Top)</h2>
            <button 
              onClick={fetchFundingRates}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition"
            >
              {loading ? 'Оновлення...' : '🔄 Оновити'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4">Пара</th>
                  <th className="text-right py-4 px-4">Funding Rate</th>
                  <th className="text-right py-4 px-4">Predicted</th>
                  <th className="text-right py-4 px-4">Час</th>
                </tr>
              </thead>
              <tbody>
                {fundingRates.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="py-4 px-4 font-medium">{item.symbol}</td>
                    <td className="text-right py-4 px-4 text-emerald-400 font-bold">
                      {item.fundingRate}%
                    </td>
                    <td className="text-right py-4 px-4 text-gray-400">
                      {item.predictedRate}%
                    </td>
                    <td className="text-right py-4 px-4 text-gray-500 text-sm">
                      {item.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}