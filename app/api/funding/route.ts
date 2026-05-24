import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'testnet';

  try {
    const baseUrl = mode === 'testnet' 
      ? 'https://api-testnet.bybit.com' 
      : 'https://api.bybit.com';

    const response = await fetch(`${baseUrl}/v5/market/funding/history?category=linear&limit=50`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Bybit status: ${response.status}`);
      throw new Error(`Bybit API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result?.list) {
      throw new Error('No data received from Bybit');
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
    console.error('Bybit Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Bybit тимчасово недоступний. Спробуйте пізніше або використовуйте Testnet.'
    }, { status: 500 });
  }
}