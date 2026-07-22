import crypto from "crypto"
import type { PaytrCredentials } from "@/lib/paytrSettings"
import { DEFAULT_SITE_URL } from "@/lib/siteUrl"

export interface PaytrTokenParams {
  merchantOid: string
  email: string
  paymentAmount: number
  userBasket: [string, string, number][]
  userName: string
  userAddress: string
  userPhone: string
  userIp: string
  debugOn?: number
  testMode?: number
  noInstallment?: number
  maxInstallment?: number
  currency?: string
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || DEFAULT_SITE_URL
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer)
}

export async function getPaytrToken(credentials: PaytrCredentials, params: PaytrTokenParams) {
  const { merchantId, merchantKey, merchantSalt, testMode: testModeBool } = credentials

  const {
    merchantOid,
    email,
    paymentAmount,
    userBasket,
    userName,
    userAddress,
    userPhone,
    userIp,
    debugOn = 1,
    testMode = testModeBool ? 1 : 0,
    noInstallment = 0,
    maxInstallment = 0,
    currency = "TL",
  } = params

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error("PayTR bilgileri eksik. Admin panelinden veya ortam değişkenlerinden yapılandırın.")
  }

  const siteUrl = getSiteUrl()

  const merchantOkUrl = `${siteUrl}/checkout/basarili?orderNo=${encodeURIComponent(
    merchantOid,
  )}`

  const merchantFailUrl = `${siteUrl}/checkout/hata?orderNo=${encodeURIComponent(
    merchantOid,
  )}`

  const paymentAmountStr = Math.round(paymentAmount).toString()

  const userBasketBase64 = Buffer.from(JSON.stringify(userBasket)).toString("base64")

  const hashStr =
    merchantId +
    userIp +
    merchantOid +
    email +
    paymentAmountStr +
    userBasketBase64 +
    noInstallment +
    maxInstallment +
    currency +
    testMode

  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64")

  const formData = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: paymentAmountStr,
    paytr_token: paytrToken,
    user_basket: userBasketBase64,
    debug_on: debugOn.toString(),
    no_installment: noInstallment.toString(),
    max_installment: maxInstallment.toString(),
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    timeout_limit: "30",
    currency,
    test_mode: testMode.toString(),
  })

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
  })

  const resText = await response.text()

  let resJson: {
    status?: string
    token?: string
    reason?: string
  }

  try {
    resJson = JSON.parse(resText)
  } catch {
    throw new Error(`PayTR geçersiz cevap döndü: ${resText}`)
  }

  if (!response.ok) {
    throw new Error(resJson.reason || `PayTR HTTP hatası: ${response.status}`)
  }

  if (resJson.status === "success" && resJson.token) {
    return { token: resJson.token }
  }

  throw new Error(resJson.reason || "PayTR token alınamadı.")
}

export function verifyPaytrCallback(
  credentials: PaytrCredentials,
  params: {
    merchant_oid: string
    status: string
    total_amount: string
    hash: string
  }
) {
  const { merchantKey, merchantSalt } = credentials
  const { merchant_oid, status, total_amount, hash } = params

  if (!merchantKey || !merchantSalt) {
    return false
  }

  if (!merchant_oid || !status || !total_amount || !hash) {
    return false
  }

  const hashStr = merchant_oid + merchantSalt + status + total_amount

  const computedHash = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr)
    .digest("base64")

  return safeCompare(computedHash, hash)
}
