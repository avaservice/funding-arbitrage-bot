import { NextResponse } from 'next/server';

const BYBIT_MAINNET_URLS = [
  "https://api.bybit.com",
  "https://api.bytick.com",
];

const BYBIT_DEMO_URLS = [
  "https://api-demo.bybit.com",
  "https://api-demo.bytick.com",
];

async function fetchBybit(path: string, mode: string = 'demo'): Promise<any> {
  const urls = mode === 'demo' ? BYBIT_DEMO_URLS : BYBIT_MAINNET_URLS;

  for (const baseUrl of urls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'CapustaArbitrageBot/1.0'
        },
        cache: 'no-store'
      });

      if (response.status === 403) {
        console.warn(`403 blocked at ${baseUrl}, trying next...`);
        continue;
      }

      return await response.json();
    } catch (e) {
      console.warn(`Fetch failed for ${baseUrl}:`, e);
      continue;
    }
  }

  throw new Error('All Bybit endpoints unavailable');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'demo';

  try {
    const data = await fetchBybit(`/v5/market/funding/history?category=linear&limit=100`, mode);

    if (data.retCode !== 0) {
      throw new Error(data.retMsg || 'Bybit API error');
    }

    const formatted = data.result.list.map((item: any) => ({
      symbol: item.symbol.replace('USDT', ''),
      fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
      predictedRate: parseFloat((parseFloat(item.fundingRate) * 100 * 0.9).toFixed(4)),
      timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
    }));

    return NextResponse.json({
      success: true,
      mode,
      data: formatted.slice(0, 25)
    });

  } catch (error: any) {
    console.error('Bybit Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Bybit API недоступний'
    }, { status: 500 });
  }
}