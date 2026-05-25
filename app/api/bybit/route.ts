import { NextResponse } from "next/server";
import crypto from "crypto";

const BASE_URL = "https://api.bybit.com";
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

async function getBalance() {
  return await privateRequest("/v5/account/wallet-balance", {
    accountType: "UNIFIED",
  });
}

export async function GET() {
  try {
    const balanceData = await getBalance();
    return NextResponse.json({
      success: true,
      balanceData,
    });
  } catch (error) {
    console.error("Bybit Error:", error);
    return NextResponse.json({
      success: false,
      error: "Не вдалося отримати баланс",
    });
  }
}
