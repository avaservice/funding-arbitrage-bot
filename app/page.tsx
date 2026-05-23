'use client'

import { useState, useEffect } from 'react'

export default function FundingArbitrageBot() {
  const [mode, setMode] = useState<'testnet' | 'mainnet'>('testnet')
  const [status, setStatus] = useState('🧪 Підключення...')
  const [fundingRates, setFundingRates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMockData()
  }, [mode])

  // Тимчасово використовуємо мок-дані (імітація)
  function fetchMockData() {
    setLoading(true)
    setStatus(mode === 'testnet' ? '🧪 Testnet Mode' : '🔥 Mainnet Mode')

    // Імітація даних
    const mockData = [
      { symbol: "BTCUSDT", fundingRate: "0.0152", predictedRate: "0.0128", timestamp: "14:32" },
      { symbol: "ETHUSDT", fundingRate: "0.0087", predictedRate: "0.0091", timestamp: "14:32" },
      { symbol: "SOLUSDT", fundingRate: "0.0234", predictedRate: "0.0195", timestamp: "14:32" },
      { symbol: "XRPUSDT", fundingRate: "-0.0045", predictedRate: "-0.0021", timestamp: "14:32" },
    ]

    setFundingRates(mockData)
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
              className={`px-8 py-3 rounded-2xl font-medium transition-all ${mode === 'testnet' ? 'bg-emerald-600' : 'bg-gray-800'}`}
            >
              🧪 Testnet
            </button>
            <button
              onClick={() => setMode('mainnet')}
              className={`px-8 py-3 rounded-2xl font-medium transition-all ${mode === 'mainnet' ? 'bg-red-600' : 'bg-gray-800'}`}
            >
              🔥 Mainnet
            </button>
          </div>
        </header>

        <div className="bg-gray-900 rounded-3xl p-8">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold">Funding Rates</h2>
            <button 
              onClick={fetchMockData}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl"
            >
              🔄 Оновити
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-4 px-4">Пара</th>
                  <th className="py-4 px-4 text-right">Funding Rate</th>
                  <th className="py-4 px-4 text-right">Predicted</th>
                  <th className="py-4 px-4 text-right">Час</th>
                </tr>
              </thead>
              <tbody>
                {fundingRates.map((item, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-4 font-medium">{item.symbol}</td>
                    <td className={`py-4 px-4 text-right font-bold ${parseFloat(item.fundingRate) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.fundingRate}%
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400">{item.predictedRate}%</td>
                    <td className="py-4 px-4 text-right text-gray-500">{item.timestamp}</td>
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