import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'testnet';

  try {
    const baseURL = mode === 'testnet' 
      ? 'https://api-testnet.bybit.com' 
      : 'https://api.bybit.com';

    const response = await fetch(`${baseURL}/v5/market/funding/history?category=linear&limit=100`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FundingBot/1.0)',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 10 } // оновлення кожні 10 секунд
    });

    if (!response.ok) {
      throw new Error(`Bybit returned ${response.status}`);
    }

    const json = await response.json();

    const data = json.result?.list?.map((item: any) => ({
      symbol: item.symbol.replace('USDT', ''),
      fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
      predictedRate: parseFloat((parseFloat(item.fundingRate) * 100 * 0.85).toFixed(4)), // приблизно
      timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
    })) || [];

    return NextResponse.json({
      success: true,
      mode,
      data: data.slice(0, 25)
    });

  } catch (error: any) {
    console.error("Bybit API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}