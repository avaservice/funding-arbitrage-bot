import { NextResponse } from "next/server";
import crypto from "crypto";

const BASE_URL = "https://api.bybit.com"; // один endpoint для реальних і тестових ключів
const API_KEY = process.env.BYBIT_API_KEY!;
const API_SECRET = process.env.BYBIT_API_SECRET!;

function generateSignature(timestamp: string, apiKey: string, recvWindow: string, queryString: string, apiSecret: string) {
  const signPayload = timestamp + apiKey + recvWindow + queryString;
  return crypto.createHmac("sha256", apiSecret).update(signPayload).digest("hex");
}

async function makeBybitRequest(endpoint: string, method: string, params: Record<string, any>) {
  const timestamp = Date.now().toString();
  const recvWindow = "20000";

  let queryString = "";
  let body = "";
  if (method === "GET") {
    const sorted = Object.keys(params).sort().reduce((acc, k) => { acc[k] = params[k]; return acc; }, {} as Record<string, any>);
    queryString = new URLSearchParams(sorted).toString();
  } else {
    body = JSON.stringify(params);
    queryString = body;
  }

  const signature = generateSignature(timestamp, API_KEY, recvWindow, queryString, API_SECRET);

  const headers: Record<string, string> = {
    "X-BAPI-API-KEY": API_KEY,
    "X-BAPI-SIGN": signature,
    "X-BAPI-SIGN-TYPE": "2",
    "X-BAPI-TIMESTAMP": timestamp,
    "X-BAPI-RECV-WINDOW": recvWindow,
    "Content-Type": "application/json",
  };

  const url = method === "GET" && queryString ? `${BASE_URL}${endpoint}?${queryString}` : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, { method, headers, body: method !== "GET" ? body : undefined });
  return await response.json();
}

export async function GET() {
  try {
    // Баланс
    const balanceData = await makeBybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });

    // Позиції
    const positions = await makeBybitRequest("/v5/position/list", "GET", { category: "linear", settleCoin: "USDT" });

    // Витягуємо баланс USDT
    let usdtBalance = 0;
    if (balanceData?.result?.list?.[0]) {
      const account = balanceData.result.list[0];
      const usdtCoin = account.coin?.find((c: any) => c.coin === "USDT");
      if (usdtCoin) {
        usdtBalance = parseFloat(usdtCoin.walletBalance) || 0;
      }
    }

    return NextResponse.json({
      success: true,
      balance: usdtBalance,
      positions: positions?.result?.list || [],
    });
  } catch (error) {
    console.error("Bybit Error:", error);
    return NextResponse.json({
      success: false,
      error: "Не вдалося отримати дані з Bybit",
    });
  }
}
