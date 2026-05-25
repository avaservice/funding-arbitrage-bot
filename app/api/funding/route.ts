import { NextResponse } from 'next/server';

const BYBIT_ENDPOINTS = [
  "https://api-demo.bybit.com",
  "https://api.bybit.com",
  "https://api.bytick.com",
  "https://api-demo.bytick.com"
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'demo';

  console.log(`[Funding API] Request with mode: ${mode}`);

  for (const baseUrl of BYBIT_ENDPOINTS) {
    try {
      const url = `${baseUrl}/v5/market/funding/history?category=linear&limit=60`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
      });

      if (response.status === 403) {
        console.log(`403 Forbidden at ${baseUrl}`);
        continue;
      }

      const data = await response.json();

      if (data.retCode === 0 && data.result?.list?.length > 0) {
        const formatted = data.result.list.slice(0, 30).map((item: any) => ({
          symbol: item.symbol.replace('USDT', ''),
          fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
          predictedRate: parseFloat((parseFloat(item.fundingRate) * 100 * 0.9).toFixed(4)),
          timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
        }));

        return NextResponse.json({
          success: true,
          mode,
          data: formatted,
          source: baseUrl
        });
      }
    } catch (err) {
      console.log(`Failed ${baseUrl}`);
      continue;
    }
  }

  // Якщо всі спроби провалилися
  return NextResponse.json({
    success: false,
    error: "Bybit API тимчасово недоступний. Спробуйте пізніше або змініть режим."
  }, { status: 503 });
}