import api from '@/api/client'
import axios from 'axios'

export interface BakongConfig {
  apiUrl: string
  token: string
  accountId: string
  accountInformation?: string
  acquiringBank?: string
  mobileNumber?: string
  merchantName: string
  merchantCity: string
  bankName: string
}

export interface GeneratedKHQR {
  qr: string
  md5: string
  amount: number
  currency: string
  bill_number: string
  account_id: string
  bank_name: string
  merchant_name: string
  merchant_city: string
  expires_at?: string
}

export interface BakongTransactionResult {
  is_paid: boolean
  response_code: number
  response_message: string
  data?: {
    hash?: string
    fromAccountId?: string
    toAccountId?: string
    amount?: number
    currency?: string
    description?: string
    createdDateMs?: number
    [key: string]: any
  } | null
}

const STORAGE_KEY = 'bakong_khqr_config'

export const DEFAULT_BAKONG_CONFIG: BakongConfig = {
  apiUrl: 'https://api-bakong.nbc.gov.kh/v1',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiZTRlMzE2Njc1ZWYyNDc1YSJ9LCJpYXQiOjE3ODkwMjc4NzUsImV4cCI6MTc5NjgwMzg3NX0.6jz8USirCBQEVyZxxxrZ8aKHx_AoSxoJnmMYDWhCBjs',
  accountId: 'khqr@aclb',
  accountInformation: '85520019493',
  acquiringBank: 'ACLEDA',
  mobileNumber: '0762825595',
  merchantName: 'SAK OUSA',
  merchantCity: 'Phnom Penh',
  bankName: 'ACLEDA Bank',
}

export const getBakongConfig = (): BakongConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // If legacy config had placeholder accountId without accountInformation, migrate to official SAK OUSA
      if (!parsed.accountInformation || parsed.accountId === '010022334455@aclb' || parsed.accountId === '0762825595@aclb') {
        localStorage.removeItem(STORAGE_KEY)
        return DEFAULT_BAKONG_CONFIG
      }
      return { ...DEFAULT_BAKONG_CONFIG, ...parsed }
    }
  } catch {}
  return DEFAULT_BAKONG_CONFIG
}

export const saveBakongConfig = (config: Partial<BakongConfig>): BakongConfig => {
  const current = getBakongConfig()
  const updated = { ...current, ...config }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
  return updated
}

/**
 * Generate Bakong KHQR Payload (Backend first, client-side fallback)
 */
export const generateKHQR = async (params: {
  amount: number
  currency?: string
  billNumber?: string
}): Promise<GeneratedKHQR> => {
  const config = getBakongConfig()

  try {
    const response = await api.post('/pos/khqr/generate', {
      amount: params.amount,
      currency: params.currency || 'USD',
      bill_number: params.billNumber,
      account_id: config.accountId,
      account_information: config.accountInformation || '85520019493',
      acquiring_bank: config.acquiringBank || 'ACLEDA',
      mobile_number: config.mobileNumber || '0762825595',
      merchant_name: config.merchantName,
      merchant_city: config.merchantCity,
    })

    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
  } catch (error) {
    console.warn('Backend /pos/khqr/generate error, trying client-side fallback:', error)
  }

  // Client-side fallback using bakong-khqr SDK
  try {
    const { BakongKHQR, IndividualInfo, khqrData } = await import('bakong-khqr')
    const khqr = new BakongKHQR()
    const billNo = params.billNumber || `KHQR-${Date.now().toString().slice(-6)}`
    const isUSD = (params.currency || 'USD').toUpperCase() === 'USD'

    const individualInfo = new IndividualInfo(
      config.accountId,
      config.merchantName,
      config.merchantCity,
      {
        accountInformation: config.accountInformation || '85520019493',
        acquiringBank: config.acquiringBank || 'ACLEDA',
        mobileNumber: config.mobileNumber || '0762825595',
        currency: isUSD ? khqrData.currency.usd : khqrData.currency.khr,
        amount: params.amount,
        billNumber: billNo,
        storeLabel: 'OptaPOS Store',
        terminalLabel: 'POS-01',
        expirationTimestamp: Date.now() + 5 * 60 * 1000, // 5 mins
      }
    )

    const result = khqr.generateIndividual(individualInfo)
    if (result.data) {
      return {
        qr: result.data.qr,
        md5: result.data.md5,
        amount: params.amount,
        currency: isUSD ? 'USD' : 'KHR',
        bill_number: billNo,
        account_id: config.accountId,
        bank_name: config.bankName,
        merchant_name: config.merchantName,
        merchant_city: config.merchantCity,
      }
    }
  } catch (clientError) {
    console.error('Client-side Bakong KHQR error:', clientError)
  }

  throw new Error('Failed to generate KHQR string')
}

/**
 * Check payment status via MD5 against NBC Bakong Open API
 */
export const checkTransactionStatus = async (
  md5: string
): Promise<BakongTransactionResult> => {
  const config = getBakongConfig()

  // 1. Try Backend Proxy first
  try {
    const response = await api.post('/pos/khqr/check', { md5 })
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
  } catch (backendError) {
    console.warn('Backend proxy /pos/khqr/check failed, falling back to direct API:', backendError)
  }

  // 2. Direct call to NBC Bakong Open API
  try {
    const response = await axios.post(
      `${config.apiUrl}/check_transaction_by_md5`,
      { md5 },
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    )

    const body = response.data
    const isPaid = (body?.responseCode === 0 || body?.responseCode === '0') && !!body?.data

    return {
      is_paid: isPaid,
      response_code: Number(body?.responseCode ?? 1),
      response_message: body?.responseMessage || 'Checked',
      data: body?.data || null,
    }
  } catch (apiError: any) {
    return {
      is_paid: false,
      response_code: apiError?.response?.status || 500,
      response_message: apiError?.message || 'Network error',
      data: null,
    }
  }
}
