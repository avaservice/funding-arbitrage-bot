import { NextResponse } from 'next/server';
import ccxt from 'ccxt';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'testnet';

  try {
    const exchange = new ccxt.bybit({
      apiKey: process.env.NEXT_PUBLIC_BYBIT_API_KEY,
      secret: process.env.NEXT_PUBLIC_BYBIT_API_SECRET,
      enableRateLimit: true,
    });

    // Використовуємо Testnet якщо вказано
    if (mode === 'testnet') {
      exchange.setSandboxMode(true);
    }

    const markets = await exchange.loadMarkets();
    const symbols = Object.keys(markets)
      .filter(s => s.includes('USDT') && !s.includes('USDC'))
      .slice(0, 50);

    const fundingRates = await exchange.fetchFundingRates(symbols);

    const result = Object.entries(fundingRates).map(([symbol, data]: any) => ({
      symbol: symbol.replace(':USDT', ''),
      fundingRate: parseFloat((data.fundingRate * 100).toFixed(4)),
      predictedRate: parseFloat((data.predictedFundingRate * 100 || 0).toFixed(4)),
      timestamp: new Date(data.timestamp).toLocaleTimeString('uk-UA'),
    }));

    return NextResponse.json({
      success: true,
      mode,
      data: result.sort((a, b) => b.fundingRate - a.fundingRate)
    });

  } catch (error: any) {
    console.error('Bybit API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Помилка підключення до Bybit'
    }, { status: 500 });
  }
}