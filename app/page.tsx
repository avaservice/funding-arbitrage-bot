'use client'

import { useState, useEffect } from 'react'

export default function FundingArbitrageBot() {
  const [mode, setMode] = useState<'testnet' | 'mainnet'>('testnet')
  const [fundingRates, setFundingRates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Мок дані з розрахунком прибутку
  const mockData = [
    { symbol: "BTCUSDT", fundingRate: 0.0185, predictedRate: 0.0152, volume: "245.6M", days: 30 },
    { symbol: "ETHUSDT", fundingRate: 0.0123, predictedRate: 0.0118, volume: "189.4M", days: 30 },
    { symbol: "SOLUSDT", fundingRate: 0.0287, predictedRate: 0.0241, volume: "98.7M",  days: 30 },
    { symbol: "XRPUSDT", fundingRate: -0.0054, predictedRate: -0.0032, volume: "67.2M", days: 30 },
    { symbol: "DOGEUSDT", fundingRate: 0.0098, predictedRate: 0.0085, volume: "45.1M", days: 30 },
  ]

  useEffect(() => {
    loadData()
  }, [mode])

  function loadData() {
    setLoading(true)
    
    // Імітація затримки
    setTimeout(() => {
      const dataWithProfit = mockData.map(item => {
        const monthlyProfit = (item.fundingRate * item.days * 100).toFixed(2)
        const yearlyProfit = (parseFloat(monthlyProfit) * 12).toFixed(1)
        
        return {
          ...item,
          monthlyProfit: parseFloat(monthlyProfit),
          yearlyProfit: parseFloat(yearlyProfit),
          attractiveness: item.fundingRate > 0.015 ? "🔥 Висока" : item.fundingRate > 0.008 ? "✅ Хороша" : "⚪ Середня"
        }
      })
      
      setFundingRates(dataWithProfit.sort((a, b) => b.monthlyProfit - a.monthlyProfit))
      setLoading(false)
    }, 600)
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
            <p className="text-xl text-gray-400 mt-1">Funding Rate Arbitrage • Bybit</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMode('testnet')} className={`px-8 py-3 rounded-2xl font-medium ${mode === 'testnet' ? 'bg-emerald-600' : 'bg-gray-800'}`}>
              🧪 Testnet
            </button>
            <button onClick={() => setMode('mainnet')} className={`px-8 py-3 rounded-2xl font-medium ${mode === 'mainnet' ? 'bg-red-600' : 'bg-gray-800'}`}>
              🔥 Mainnet
            </button>
          </div>
        </header>

        <div className="bg-gray-900 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold">Потенційний прибуток</h2>
            <button 
              onClick={loadData}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl transition"
            >
              {loading ? "Оновлення..." : "🔄 Оновити дані"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-5 px-4">Пара</th>
                  <th className="text-right py-5 px-4">Funding Rate</th>
                  <th className="text-right py-5 px-4">За 30 днів</th>
                  <th className="text-right py-5 px-4">За рік</th>
                  <th className="text-center py-5 px-4">Привабливість</th>
                </tr>
              </thead>
              <tbody>
                {fundingRates.map((item, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/70 transition">
                    <td className="py-5 px-4 font-semibold text-lg">{item.symbol}</td>
                    <td className="text-right py-5 px-4 text-emerald-400 font-bold text-xl">
                      +{item.fundingRate}%
                    </td>
                    <td className="text-right py-5 px-4 text-2xl font-bold text-emerald-400">
                      +{item.monthlyProfit}%
                    </td>
                    <td className="text-right py-5 px-4 text-2xl font-bold">
                      +{item.yearlyProfit}%
                    </td>
                    <td className="text-center py-5 px-4">
                      <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400">
                        {item.attractiveness}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-gray-400 text-sm border-t border-gray-700 pt-6">
            * Розрахунок приблизний (без урахування комісій, funding payment 3 рази на день, slippage). 
            Реальний прибуток може відрізнятися.
          </div>
        </div>
      </div>
    </div>
  )
}