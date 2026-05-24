import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'testnet';

  try {
    // Публічний endpoint Bybit (не потребує ключів)
    const response = await fetch(
      'https://api.bybit.com/v5/market/funding/history?category=linear&limit=100', 
      { cache: 'no-store' }
    );

    if (!response.ok) throw new Error('Bybit API error');

    const data = await response.json();

    const formatted = data.result.list.map((item: any) => ({
      symbol: item.symbol.replace('USDT', ''),
      fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
      predictedRate: 0,
      timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
    }));

    return NextResponse.json({
      success: true,
      mode,
      data: formatted.slice(0, 30)
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      success: false,
      error: 'Не вдалося отримати дані з Bybit. Спробуйте пізніше.'
    }, { status: 500 });
  }
}