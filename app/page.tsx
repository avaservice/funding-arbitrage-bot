'use client'

import { useState, useEffect } from 'react'

export default function FundingArbitrageBot() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchBybitData() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bybit')
      const result = await res.json()

      if (!result.success) throw new Error(result.error)
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBybitData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold">🍅 CAPUSTA ARBITRAGE</h1>
            <p className="text-emerald-400">Bybit Trading Dashboard</p>
          </div>
          <button
            onClick={fetchBybitData}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl"
          >
            {loading ? 'Завантаження...' : '🔄 Оновити'}
          </button>
        </header>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {data ? (
          <div className="bg-gray-900 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6">Показники Bybit</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4">Пара</th>
                  <th className="text-right py-4">Баланс (USDT)</th>
                  <th className="text-right py-4">Угода (10%)</th>
                  <th className="text-right py-4">Ціна входу</th>
                  <th className="text-right py-4">Stop‑Loss</th>
                  <th className="text-right py-4">Take‑Profit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-4 font-medium">BTCUSDT</td>
                  <td className="text-right py-4">{data.balance}</td>
                  <td className="text-right py-4">{data.tradeAmount}</td>
                  <td className="text-right py-4">{data.entryPrice}</td>
                  <td className="text-right py-4 text-red-400">{data.stopLoss}</td>
                  <td className="text-right py-4 text-emerald-400">{data.takeProfit}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-8 mb-4">Відкриті позиції</h3>
            <pre className="bg-gray-800 p-4 rounded-xl text-sm overflow-x-auto">
              {JSON.stringify(data.positions, null, 2)}
            </pre>
          </div>
        ) : (
          <p>Завантаження даних...</p>
        )}
      </div>
    </div>
  )
}
