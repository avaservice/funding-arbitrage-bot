import { NextResponse } from 'next/server';

const BYBIT_URLS = {
  demo: [
    "https://api-demo.bybit.com",
    "https://api-demo.bytick.com"
  ],
  mainnet: [
    "https://api.bybit.com",
    "https://api.bytick.com"
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get('mode') || 'demo') as 'demo' | 'mainnet';

  const urls = BYBIT_URLS[mode];

  try {
    for (const baseUrl of urls) {
      try {
        const res = await fetch(`${baseUrl}/v5/market/funding/history?category=linear&limit=80`, {
          headers: {
            'User-Agent': 'CapustaArbitrageBot/1.0',
          },
          cache: 'no-store'
        });

        if (res.status === 403) continue;

        const data = await res.json();

        if (data.retCode === 0 && data.result?.list) {
          const formatted = data.result.list.map((item: any) => ({
            symbol: item.symbol.replace('USDT', ''),
            fundingRate: parseFloat((parseFloat(item.fundingRate) * 100).toFixed(4)),
            predictedRate: parseFloat((parseFloat(item.fundingRate) * 100 * 0.95).toFixed(4)),
            timestamp: new Date(parseInt(item.fundingTime)).toLocaleTimeString('uk-UA')
          }));

          return NextResponse.json({
            success: true,
            mode,
            data: formatted.slice(0, 30)
          });
        }
      } catch (e) {
        console.log(`Failed ${baseUrl}`);
        continue;
      }
    }

    throw new Error("All endpoints failed");
  } catch (error) {
    console.error("Bybit fetch error:", error);
    return NextResponse.json({
      success: false,
      error: "Bybit API тимчасово недоступний. Спробуйте пізніше."
    }, { status: 503 });
  }
}