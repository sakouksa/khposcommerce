import api from '@/api/client'

export const expenseService = {
  // Expenses
  getExpenses: (params: Record<string, any> = {}) =>
    api.get('/expenses', { params }).then(r => r.data),

  getExpense: (id: number) =>
    api.get(`/expenses/${id}`).then(r => r.data.data),

  createExpense: (payload: any) =>
    api.post('/expenses', payload).then(r => r.data.data),

  updateExpense: (id: number, payload: any) =>
    api.put(`/expenses/${id}`, payload).then(r => r.data.data),

  deleteExpense: (id: number) =>
    api.delete(`/expenses/${id}`).then(r => r.data),

  updateExpenseStatus: (id: number, status: string, reason?: string) =>
    api.put(`/expenses/${id}`, { status, rejection_reason: reason }).then(r => r.data.data),

  updateStatus: (id: number, status: string, reason?: string) =>
    api.put(`/expenses/${id}`, { status, rejection_reason: reason }).then(r => r.data.data),

  bulkDeleteExpenses: (ids: number[]) =>
    api.post('/expenses/bulk-delete', { ids }).then(r => r.data),

  bulkDelete: (ids: number[]) =>
    api.post('/expenses/bulk-delete', { ids }).then(r => r.data),

  // Expense Categories
  getCategories: (params: Record<string, any> = {}) =>
    api.get('/expense-categories', { params }).then(r => r.data),

  getCategory: (id: number) =>
    api.get(`/expense-categories/${id}`).then(r => r.data.data),

  createCategory: (payload: any) =>
    api.post('/expense-categories', payload).then(r => r.data.data),

  updateCategory: (id: number, payload: any) =>
    api.put(`/expense-categories/${id}`, payload).then(r => r.data.data),

  deleteCategory: (id: number) =>
    api.delete(`/expense-categories/${id}`).then(r => r.data),

  bulkDeleteCategories: (ids: number[]) =>
    api.post('/expense-categories/bulk-delete', { ids }).then(r => r.data),
}

export default expenseService
