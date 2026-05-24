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
      options: { defaultType: 'future' }
    });

    if (mode === 'testnet') {
      exchange.setSandboxMode(true);
    }

    // Отримуємо funding rates
    const fundingRates = await exchange.fetchFundingRates();

    const result = Object.entries(fundingRates)
      .filter(([symbol]) => symbol.includes('USDT'))
      .map(([symbol, data]: any) => ({
        symbol: symbol.replace(':USDT', ''),
        fundingRate: parseFloat((data.fundingRate * 100).toFixed(4)),
        predictedRate: parseFloat((data.predictedFundingRate * 100 || 0).toFixed(4)),
        timestamp: new Date(data.timestamp).toLocaleTimeString('uk-UA'),
        nextFundingTime: new Date(data.nextFundingTime).toLocaleTimeString('uk-UA')
      }))
      .sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate));

    return NextResponse.json({
      success: true,
      mode,
      data: result.slice(0, 30)
    });

  } catch (error: any) {
    console.error('Bybit Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}