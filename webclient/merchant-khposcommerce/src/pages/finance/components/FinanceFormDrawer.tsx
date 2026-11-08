import React from 'react'
import type {
  TabType,
  ExpenseForm,
  CategoryForm,
  RegisterForm,
  CurrencyForm,
  TaxForm,
  PaymentMethodForm,
  TransactionForm,
} from '../types/finance.types'
import { ExpenseFormDrawer } from './ExpenseFormDrawer'
import { CategoryFormDrawer } from './CategoryFormDrawer'
import { RegisterFormDrawer } from './RegisterFormDrawer'
import { CurrencyFormDrawer } from './CurrencyFormDrawer'
import { TaxFormDrawer } from './TaxFormDrawer'
import { PaymentMethodFormDrawer } from './PaymentMethodFormDrawer'
import { TransactionFormDrawer } from './TransactionFormDrawer'

export interface FinanceFormModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: TabType
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  categories: any[]
  expenseForm: ExpenseForm
  setExpenseForm: React.Dispatch<React.SetStateAction<ExpenseForm>>
  handleReceiptFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  categoryForm: CategoryForm
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryForm>>
  registerForm: RegisterForm
  setRegisterForm: React.Dispatch<React.SetStateAction<RegisterForm>>
  currencyForm: CurrencyForm
  setCurrencyForm: React.Dispatch<React.SetStateAction<CurrencyForm>>
  taxForm: TaxForm
  setTaxForm: React.Dispatch<React.SetStateAction<TaxForm>>
  paymentMethodForm: PaymentMethodForm
  setPaymentMethodForm: React.Dispatch<React.SetStateAction<PaymentMethodForm>>
  transactionForm: TransactionForm
  setTransactionForm: React.Dispatch<React.SetStateAction<TransactionForm>>
}

/**
 * FinanceFormDrawer acts as a modular coordinator that delegates rendering
 * to dedicated feature-specific form drawers.
 */
export const FinanceFormDrawer: React.FC<FinanceFormModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  editingItem,
  onSubmit,
  isPending,
  categories = [],
  expenseForm,
  setExpenseForm,
  handleReceiptFileChange,
  categoryForm,
  setCategoryForm,
  registerForm,
  setRegisterForm,
  currencyForm,
  setCurrencyForm,
  taxForm,
  setTaxForm,
  paymentMethodForm,
  setPaymentMethodForm,
  transactionForm,
  setTransactionForm,
}) => {
  switch (activeTab) {
    case 'expenses':
      return (
        <ExpenseFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          categories={categories}
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
          handleReceiptFileChange={handleReceiptFileChange}
        />
      )

    case 'categories':
      return (
        <CategoryFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
        />
      )

    case 'registers':
      return (
        <RegisterFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
        />
      )

    case 'currencies':
      return (
        <CurrencyFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          currencyForm={currencyForm}
          setCurrencyForm={setCurrencyForm}
        />
      )

    case 'taxes':
      return (
        <TaxFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          taxForm={taxForm}
          setTaxForm={setTaxForm}
        />
      )

    case 'payment_methods':
      return (
        <PaymentMethodFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          paymentMethodForm={paymentMethodForm}
          setPaymentMethodForm={setPaymentMethodForm}
        />
      )

    case 'transactions':
      return (
        <TransactionFormDrawer
          isOpen={isOpen}
          onClose={onClose}
          editingItem={editingItem}
          onSubmit={onSubmit}
          isPending={isPending}
          transactionForm={transactionForm}
          setTransactionForm={setTransactionForm}
        />
      )

    default:
      return null
  }
}

export default FinanceFormDrawer
