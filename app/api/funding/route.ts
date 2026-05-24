import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'testnet';

  try {
    // Актуальний публічний endpoint Bybit v5
    const url = `https://api${mode === 'testnet' ? '-testnet' : ''}.bybit.com/v5/market/funding/history?category=linear&limit=80`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result || !data.result.list) {
      throw new Error('No funding data received');
    }

    const formatted = data.result.list.map((item: any) => ({
      symbol: item.symbol.replace('USDT', ''),
      fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
      predictedRate: 0,
      timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
    }));

    return NextResponse.json({
      success: true,
      mode,
      data: formatted
    });

  } catch (error: any) {
    console.error('Bybit API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Не вдалося підключитися до Bybit'
    }, { status: 500 });
  }
}