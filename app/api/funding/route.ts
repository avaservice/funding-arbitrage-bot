import crypto from 'crypto';

const API_KEY = process.env.BYBIT_API_KEY!;
const API_SECRET = process.env.BYBIT_API_SECRET!;
const BASE_URL = 'https://api-testnet.bybit.com';

function signRequest(params: Record<string,string>) {
  const ordered = Object.keys(params).sort().map(k=>`${k}=${params[k]}`).join('&');
  return crypto.createHmac('sha256', API_SECRET).update(ordered).digest('hex');
}

export async function placeOrder() {
  const params: Record<string,string> = {
    category:'linear',
    symbol:'BTCUSDT',
    side:'Buy',
    orderType:'Limit',
    qty:'0.001',
    price:'65000',
    timeInForce:'GTC',
    api_key:API_KEY,
    timestamp:Date.now().toString(),
  };
  params['sign'] = signRequest(params);

  const res = await fetch(`${BASE_URL}/v5/order/create`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(params)
  });
  console.log(await res.json());
}
