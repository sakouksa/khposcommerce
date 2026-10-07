import React from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'

export const FinancePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  if (tab === 'categories') return <Navigate to="/finance/categories" replace />
  if (tab === 'registers') return <Navigate to="/finance/registers" replace />
  if (tab === 'transactions') return <Navigate to="/finance/transactions" replace />
  if (tab === 'payment_methods' || tab === 'payments') return <Navigate to="/finance/payment-methods" replace />
  if (tab === 'currencies') return <Navigate to="/finance/currencies" replace />
  if (tab === 'taxes') return <Navigate to="/finance/taxes" replace />
  return <Navigate to="/finance/expenses" replace />
}

export default FinancePage
