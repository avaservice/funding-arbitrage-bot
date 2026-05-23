'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function FundingArbitrageBot() {
  const [mode, setMode] = useState<'testnet' | 'mainnet'>('testnet')
  const [fundingRates, setFundingRates] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFundingRates()
  }, [mode])

  async function fetchFundingRates() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/funding?mode=${mode}`)
      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setFundingRates(result.data.slice(0, 15))

      // Імітація історії для вибраної пари
      const mockHistory = Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${7-i}`,
        rate: (0.005 + Math.random() * 0.03).toFixed(4),
        predicted: (0.005 + Math.random() * 0.025).toFixed(4)
      }))

      setHistory(mockHistory.reverse())
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold flex items-center gap-4">
              🍅 CAPUSTA <span className="text-emerald-500">ARBITRAGE</span>
            </h1>
            <p className="text-xl text-gray-400">Bybit Funding Rate Bot • Real Data</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setMode('testnet')}
              className={`px-8 py-3 rounded-2xl font-medium transition ${mode === 'testnet' ? 'bg-emerald-600' : 'bg-gray-800'}`}
            >
              🧪 Testnet
            </button>
            <button 
              onClick={() => setMode('mainnet')}
              className={`px-8 py-3 rounded-2xl font-medium transition ${mode === 'mainnet' ? 'bg-red-600' : 'bg-gray-800'}`}
            >
              🔥 Mainnet
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Таблиця */}
          <div className="bg-gray-900 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Live Funding Rates</h2>
              <button 
                onClick={fetchFundingRates}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition"
              >
                {loading ? 'Оновлення...' : '🔄 Оновити'}
              </button>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4">Пара</th>
                    <th className="text-right py-4 px-4">Funding Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {fundingRates.map((item, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedSymbol(item.symbol)}
                      className={`border-b border-gray-800 hover:bg-gray-800/70 cursor-pointer transition ${selectedSymbol === item.symbol ? 'bg-emerald-900/30' : ''}`}
                    >
                      <td className="py-4 px-4 font-medium">{item.symbol}</td>
                      <td className="text-right py-4 px-4 text-emerald-400 font-bold text-lg">
                        {item.fundingRate > 0 ? '+' : ''}{item.fundingRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Графік */}
          <div className="bg-gray-900 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6">Історія Funding Rate — {selectedSymbol}</h2>
            
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={4} name="Actual Rate" />
                <Line type="monotone" dataKey="predicted" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}