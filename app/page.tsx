'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function FundingArbitrageBot() {
  const [mode, setMode] = useState<'testnet' | 'mainnet'>('testnet')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [fundingRates, setFundingRates] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keysSaved, setKeysSaved] = useState(false)

  // Завантаження ключів з localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('bybit_api_key')
    const savedSecret = localStorage.getItem('bybit_api_secret')
    if (savedKey) setApiKey(savedKey)
    if (savedSecret) setApiSecret(savedSecret)
    if (savedKey && savedSecret) setKeysSaved(true)
  }, [])

  const saveKeys = () => {
    if (apiKey && apiSecret) {
      localStorage.setItem('bybit_api_key', apiKey)
      localStorage.setItem('bybit_api_secret', apiSecret)
      setKeysSaved(true)
      alert('✅ API ключі збережено!')
    } else {
      alert('Введіть обидва ключі')
    }
  }

  async function fetchFundingRates() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/funding?mode=${mode}`)
      const result = await res.json()

      if (!result.success) throw new Error(result.error)

      setFundingRates(result.data.slice(0, 12))

      // Імітація історії
      const mockHistory = Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${7-i}`,
        rate: (0.005 + Math.random() * 0.025).toFixed(4),
        predicted: (0.005 + Math.random() * 0.02).toFixed(4)
      }))
      setHistory(mockHistory.reverse())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold">🍅 CAPUSTA ARBITRAGE</h1>
            <p className="text-emerald-400">Bybit Funding Rate Bot</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMode('testnet')} className={`px-6 py-3 rounded-2xl ${mode === 'testnet' ? 'bg-emerald-600' : 'bg-gray-800'}`}>Testnet</button>
            <button onClick={() => setMode('mainnet')} className={`px-6 py-3 rounded-2xl ${mode === 'mainnet' ? 'bg-red-600' : 'bg-gray-800'}`}>Mainnet</button>
          </div>
        </header>

        {/* Форма API ключів */}
        <div className="bg-gray-900 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔑 Bybit API Ключі</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm"
            />
            <input
              type="password"
              placeholder="API Secret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm"
            />
            <button
              onClick={saveKeys}
              className="bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium"
            >
              {keysSaved ? '✅ Збережено' : 'Зберегти ключі'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Ключі зберігаються тільки у твоєму браузері (localStorage)
          </p>
        </div>

        {/* Основний контент */}
        <div className="bg-gray-900 rounded-3xl p-8">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold">Live Funding Rates</h2>
            <button onClick={fetchFundingRates} disabled={loading} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl">
              {loading ? 'Завантаження...' : '🔄 Оновити'}
            </button>
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          {/* Таблиця + Графік */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4">Пара</th>
                    <th className="text-right py-4">Funding Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {fundingRates.map((item, i) => (
                    <tr key={i} onClick={() => setSelectedSymbol(item.symbol)} className="cursor-pointer hover:bg-gray-800 border-b border-gray-800">
                      <td className="py-4 font-medium">{item.symbol}</td>
                      <td className="text-right py-4 text-emerald-400 font-bold">{item.fundingRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-lg mb-4">Історія — {selectedSymbol}</h3>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                  <XAxis dataKey="time"/>
                  <YAxis/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}