import { NextResponse } from "next/server";
import crypto from "crypto";

const BASE_URL = "https://api-testnet.bybit.com"; // для тестів
const API_KEY = process.env.BYBIT_API_KEY!;
const API_SECRET = process.env.BYBIT_API_SECRET!;

function signRequest(params: Record<string, string>) {
  const ordered = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHmac("sha256", API_SECRET).update(ordered).digest("hex");
}

async function privateRequest(path: string, params: Record<string, string>) {
  params.api_key = API_KEY;
  params.timestamp = Date.now().toString();
  params.sign = signRequest(params);

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  return await response.json();
}

// --- Баланс ---
async function getBalance() {
  return await privateRequest("/v5/account/wallet-balance", {
    accountType: "UNIFIED",
  });
}

// --- Позиції ---
async function getPositions() {
  return await privateRequest("/v5/position/list", {
    category: "linear",
    symbol: "BTCUSDT",
  });
}

// --- Торгівля: створення ордеру з стоп-лоссом ---
async function placeOrder(amountUSDT: number, entryPrice: number) {
  // стоп-лосс на 2% нижче ціни входу
  const stopLossPrice = (entryPrice * 0.98).toFixed(2);

  return await privateRequest("/v5/order/create", {
    category: "linear",
    symbol: "BTCUSDT",
    side: "Buy",
    orderType: "Market",
    qty: amountUSDT.toString(),
    timeInForce: "GTC",
    stopLoss: stopLossPrice, // стоп-лосс
  });
}

export async function GET() {
  try {
    const balanceData = await getBalance();
    const usdtBalance = parseFloat(balanceData.result.list[0].coin[0].walletBalance);

    // беремо 10% від балансу
    const tradeAmount = usdtBalance * 0.1;

    // для прикладу беремо поточну ціну BTC ~65000
    const entryPrice = 65000;

    const order = await placeOrder(tradeAmount, entryPrice);
    const positions = await getPositions();

    return NextResponse.json({
      success: true,
      balance: usdtBalance,
      tradeAmount,
      entryPrice,
      stopLoss: (entryPrice * 0.98).toFixed(2),
      order,
      positions,
    });
  } catch (error) {
    console.error("Bybit Error:", error);
    return NextResponse.json({
      success: false,
      error: "Не вдалося виконати запит",
    });
  }
}
