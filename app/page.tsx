'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function FundingArbitrageBot() {
  const [mode, setMode] = useState<'testnet' | 'mainnet'>('testnet')
  const [fundingRates, setFundingRates] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [loading, setLoading] = useState(false)

  const mockCurrent = [
    { symbol: "BTCUSDT", fundingRate: 0.0185, volume: "245M" },
    { symbol: "ETHUSDT", fundingRate: 0.0123, volume: "189M" },
    { symbol: "SOLUSDT", fundingRate: 0.0287, volume: "98M" },
    { symbol: "XRPUSDT", fundingRate: -0.0054, volume: "67M" },
  ]

  // Історія funding rate для вибраної пари
  const mockHistory = {
    BTCUSDT: [
      { time: 'Day 7', rate: 0.012, predicted: 0.011 },
      { time: 'Day 6', rate: 0.015, predicted: 0.014 },
      { time: 'Day 5', rate: 0.009, predicted: 0.010 },
      { time: 'Day 4', rate: 0.022, predicted: 0.020 },
      { time: 'Day 3', rate: 0.018, predicted: 0.017 },
      { time: 'Day 2', rate: 0.014, predicted: 0.015 },
      { time: 'Today', rate: 0.0185, predicted: 0.016 },
    ]
  }

  useEffect(() => {
    loadCurrentRates()
  }, [mode])

  function loadCurrentRates() {
    setLoading(true)
    setTimeout(() => {
      setFundingRates(mockCurrent)
      setHistory(mockHistory.BTCUSDT)
      setLoading(false)
    }, 500)
  }

  function selectSymbol(symbol: string) {
    setSelectedSymbol(symbol)
    setHistory(mockHistory.BTCUSDT) // для прикладу
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold flex items-center gap-4">
              🍅 CAPUSTA <span className="text-emerald-500">ARBITRAGE</span>
            </h1>
            <p className="text-xl text-gray-400">Funding Rate History & Analysis</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMode('testnet')} className={`px-8 py-3 rounded-2xl ${mode === 'testnet' ? 'bg-emerald-600' : 'bg-gray-800'}`}>🧪 Testnet</button>
            <button onClick={() => setMode('mainnet')} className={`px-8 py-3 rounded-2xl ${mode === 'mainnet' ? 'bg-red-600' : 'bg-gray-800'}`}>🔥 Mainnet</button>
          </div>
        </header>

        {/* Поточні ставки */}
        <div className="bg-gray-900 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Поточні Funding Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fundingRates.map((item, i) => (
              <div 
                key={i} 
                onClick={() => selectSymbol(item.symbol)}
                className={`p-6 rounded-2xl cursor-pointer transition hover:scale-105 ${selectedSymbol === item.symbol ? 'bg-emerald-600/30 border border-emerald-500' : 'bg-gray-800'}`}
              >
                <p className="text-xl font-bold">{item.symbol}</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">+{item.fundingRate}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Графік */}
        <div className="bg-gray-900 rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Історія Funding Rate — {selectedSymbol}</h2>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} name="Funding Rate" />
              <Line type="monotone" dataKey="predicted" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}