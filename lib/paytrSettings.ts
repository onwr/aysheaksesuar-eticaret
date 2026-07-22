import type { PrismaClient } from "@/generated/prisma/client"

export const PAYTR_MERCHANT_ID_KEY = "PAYTR_MERCHANT_ID"
export const PAYTR_MERCHANT_KEY_KEY = "PAYTR_MERCHANT_KEY"
export const PAYTR_MERCHANT_SALT_KEY = "PAYTR_MERCHANT_SALT"
export const PAYTR_TEST_MODE_KEY = "PAYTR_TEST_MODE"
export const PAYTR_CARD_ENABLED_KEY = "PAYTR_CARD_ENABLED"

export const PAYTR_SETTING_KEYS = [
  PAYTR_MERCHANT_ID_KEY,
  PAYTR_MERCHANT_KEY_KEY,
  PAYTR_MERCHANT_SALT_KEY,
  PAYTR_TEST_MODE_KEY,
  PAYTR_CARD_ENABLED_KEY,
] as const

export type PaytrCredentials = {
  merchantId: string
  merchantKey: string
  merchantSalt: string
  testMode: boolean
}

export type PaytrSettingsForAdmin = {
  merchantId: string
  testMode: boolean
  cardPaymentEnabled: boolean
  hasMerchantKey: boolean
  hasMerchantSalt: boolean
  /** Veritabanı boşken .env değerleri kullanılıyorsa true */
  usingEnvFallback: boolean
}

function envCredentials(): PaytrCredentials {
  return {
    merchantId: (process.env.PAYTR_MERCHANT_ID ?? "").trim(),
    merchantKey: (process.env.PAYTR_MERCHANT_KEY ?? "").trim(),
    merchantSalt: (process.env.PAYTR_MERCHANT_SALT ?? "").trim(),
    testMode: process.env.PAYTR_TEST_MODE === "1",
  }
}

function parseTestMode(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null || raw === "") return fallback
  return raw === "1" || raw === "true"
}

function parseCardEnabled(raw: string | undefined): boolean {
  if (raw == null || raw === "") return true
  return raw === "1" || raw === "true"
}

export async function isCardPaymentEnabled(prisma: PrismaClient): Promise<boolean> {
  const row = await prisma.setting.findUnique({
    where: { key: PAYTR_CARD_ENABLED_KEY },
    select: { value: true },
  })
  return parseCardEnabled(row?.value)
}

export async function getPaytrSettingsFromDb(prisma: PrismaClient): Promise<PaytrCredentials> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...PAYTR_SETTING_KEYS] } },
    select: { key: true, value: true },
  })
  const map = new Map(rows.map((r) => [r.key, r.value]))

  const env = envCredentials()
  const hasTestRow = map.has(PAYTR_TEST_MODE_KEY)

  return {
    merchantId: (map.get(PAYTR_MERCHANT_ID_KEY) ?? "").trim(),
    merchantKey: map.get(PAYTR_MERCHANT_KEY_KEY) ?? "",
    merchantSalt: map.get(PAYTR_MERCHANT_SALT_KEY) ?? "",
    testMode: hasTestRow ? parseTestMode(map.get(PAYTR_TEST_MODE_KEY), env.testMode) : env.testMode,
  }
}

/** Ödeme ve callback için: DB doluysa DB, boş alanlar .env ile tamamlanır. */
export async function getPaytrConfig(prisma: PrismaClient): Promise<PaytrCredentials> {
  const db = await getPaytrSettingsFromDb(prisma)
  const env = envCredentials()

  return {
    merchantId: db.merchantId || env.merchantId,
    merchantKey: db.merchantKey || env.merchantKey,
    merchantSalt: db.merchantSalt || env.merchantSalt,
    testMode: db.merchantId || db.merchantKey || db.merchantSalt ? db.testMode : env.testMode,
  }
}

export async function getPaytrConfigForAdmin(prisma: PrismaClient): Promise<PaytrSettingsForAdmin> {
  const db = await getPaytrSettingsFromDb(prisma)
  const env = envCredentials()
  const dbConfigured = Boolean(db.merchantId || db.merchantKey || db.merchantSalt)
  const cardPaymentEnabled = await isCardPaymentEnabled(prisma)

  return {
    merchantId: db.merchantId,
    testMode: db.testMode,
    cardPaymentEnabled,
    hasMerchantKey: db.merchantKey.length > 0,
    hasMerchantSalt: db.merchantSalt.length > 0,
    usingEnvFallback: !dbConfigured && Boolean(env.merchantId && env.merchantKey && env.merchantSalt),
  }
}

export type PersistPaytrInput = {
  merchantId: string
  testMode: boolean
  cardPaymentEnabled: boolean
  merchantKey?: string
  merchantSalt?: string
}

export async function persistPaytrSettings(prisma: PrismaClient, data: PersistPaytrInput): Promise<void> {
  const entries: Array<{ key: string; value: string }> = [
    { key: PAYTR_MERCHANT_ID_KEY, value: data.merchantId.trim() },
    { key: PAYTR_TEST_MODE_KEY, value: data.testMode ? "1" : "0" },
    { key: PAYTR_CARD_ENABLED_KEY, value: data.cardPaymentEnabled ? "1" : "0" },
  ]

  if (data.merchantKey !== undefined && data.merchantKey.length > 0) {
    entries.push({ key: PAYTR_MERCHANT_KEY_KEY, value: data.merchantKey })
  }
  if (data.merchantSalt !== undefined && data.merchantSalt.length > 0) {
    entries.push({ key: PAYTR_MERCHANT_SALT_KEY, value: data.merchantSalt })
  }

  await prisma.$transaction(
    entries.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value, type: "string" },
        update: { value, type: "string" },
      })
    )
  )
}
