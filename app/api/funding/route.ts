import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'testnet';

  try {
    // Публічний endpoint Bybit (не потребує API ключів)
    const response = await fetch('https://api.bybit.com/v5/market/funding/history?category=linear&limit=50', {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!data.result || !data.result.list) {
      throw new Error('No data from Bybit');
    }

    const formatted = data.result.list.map((item: any) => ({
      symbol: item.symbol.replace('USDT', ''),
      fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
      predictedRate: 0, // Bybit не завжди повертає predicted в цьому ендпоінті
      timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
    }));

    return NextResponse.json({
      success: true,
      mode,
      data: formatted
    });

  } catch (error: any) {
    console.error('Bybit Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Не вдалося отримати дані'
    }, { status: 500 });
  }
}