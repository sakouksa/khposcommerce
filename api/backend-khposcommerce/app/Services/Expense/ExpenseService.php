<?php

namespace App\Services\Expense;

use App\Repositories\Expense\ExpenseRepository;
use App\Models\Expense\Expense;
use App\Traits\HasFileUpload;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ExpenseService
{
    use HasFileUpload;

    public function __construct(private readonly ExpenseRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $filters = [], array $relations = []): LengthAwarePaginator
    {
        $query = $this->repository->getModel()->newQuery()->with($relations);

        // Status Filter
        if (isset($filters['status'])) {
            if ($filters['status'] === 'deleted') {
                $query->onlyTrashed();
            } elseif ($filters['status'] !== 'all' && $filters['status'] !== '') {
                $query->where('status', $filters['status']);
            }
        }

        // Category Filter
        $categoryId = $filters['expense_category_id'] ?? $filters['category_id'] ?? null;
        if ($categoryId && $categoryId !== 'all' && $categoryId !== '') {
            $query->where('expense_category_id', $categoryId);
        }

        // Branch Filter
        if (!empty($filters['branch_id']) && $filters['branch_id'] !== 'all') {
            $query->where('branch_id', $filters['branch_id']);
        }

        // User / Created By Filter
        if (!empty($filters['user_id']) && $filters['user_id'] !== 'all') {
            $query->where('user_id', $filters['user_id']);
        }

        // Date Range Filter
        $startDate = $filters['start_date'] ?? $filters['from_date'] ?? $filters['date_start'] ?? null;
        if (!empty($startDate)) {
            $query->whereDate('date', '>=', $startDate);
        }

        $endDate = $filters['end_date'] ?? $filters['to_date'] ?? $filters['date_end'] ?? null;
        if (!empty($endDate)) {
            $query->whereDate('date', '<=', $endDate);
        }

        // Amount Range Filter
        $minAmount = $filters['min_amount'] ?? $filters['amount_min'] ?? null;
        if ($minAmount !== null && $minAmount !== '' && is_numeric($minAmount)) {
            $query->where('amount', '>=', (float) $minAmount);
        }

        $maxAmount = $filters['max_amount'] ?? $filters['amount_max'] ?? null;
        if ($maxAmount !== null && $maxAmount !== '' && is_numeric($maxAmount)) {
            $query->where('amount', '<=', (float) $maxAmount);
        }

        // Keyword Search Filter
        if (!empty($filters['search'])) {
            $searchTerm = trim($filters['search']);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('reference_number', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('amount', 'like', "%{$searchTerm}%")
                  ->orWhereHas('category', function ($cq) use ($searchTerm) {
                      $cq->where('name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('branch', function ($bq) use ($searchTerm) {
                      $bq->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSortColumns = ['id', 'title', 'amount', 'date', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('date', 'desc')->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    public function getStats(array $filters = []): array
    {
        $query = $this->repository->getModel()->newQuery();

        $totalExpensesCount = (clone $query)->count();
        $totalExpensesAmount = (float) (clone $query)->sum('amount');
        $approvedAmount = (float) (clone $query)->where('status', 'approved')->sum('amount');
        $pendingAmount = (float) (clone $query)->where('status', 'pending')->sum('amount');
        $todayExpensesAmount = (float) (clone $query)->whereDate('date', today())->sum('amount');
        $thisMonthExpensesAmount = (float) (clone $query)->whereYear('date', now()->year)->whereMonth('date', now()->month)->sum('amount');

        return [
            'total_count' => $totalExpensesCount,
            'total_amount' => $totalExpensesAmount,
            'approved_amount' => $approvedAmount,
            'pending_amount' => $pendingAmount,
            'today_amount' => $todayExpensesAmount,
            'this_month_amount' => $thisMonthExpensesAmount,
        ];
    }

    public function getById(int|string $id, array $relations = []): Expense
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Expense
    {
        if (empty($data['reference_number'])) {
            $data['reference_number'] = \App\Services\Support\ReferenceNumberService::expense();
        }

        if (empty($data['company_id'])) {
            $data['company_id'] = auth()->user()?->company_id ?? 1;
        }

        if (empty($data['branch_id'])) {
            $data['branch_id'] = auth()->user()?->branch_id ?? 1;
        }

        if (empty($data['user_id'])) {
            $data['user_id'] = auth()->id() ?? 1;
        }

        if (empty($data['date'])) {
            $data['date'] = $data['expense_date'] ?? now()->toDateString();
        }

        if (isset($data['receipt'])) {
            $data['receipt'] = $this->uploadFile($data['receipt'], 'receipts');
        }

        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Expense
    {
        $existing = $this->repository->findById($id);

        if (array_key_exists('receipt', $data)) {
            $data['receipt'] = $this->uploadOrReplaceFile(
                $data['receipt'],
                $existing?->receipt,
                'receipts'
            );
        }

        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        $expense = $this->repository->getModel()->findOrFail($id);

        if (in_array($expense->status, ['approved', 'paid'])) {
            throw new \DomainException("Cannot delete expense #{$id} with status '{$expense->status}'. Only draft or rejected expenses can be deleted.");
        }

        if (!empty($expense->receipt)) {
            $this->deleteStorageFile($expense->receipt);
        }
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        if (empty($ids)) {
            return 0;
        }

        // Validate that no approved or paid expenses are selected
        $protectedExpenses = $this->repository->getModel()
            ->whereIn('id', $ids)
            ->whereIn('status', ['approved', 'paid'])
            ->get(['id', 'reference_number', 'title', 'status']);

        if ($protectedExpenses->isNotEmpty()) {
            $identifiers = $protectedExpenses->map(function ($item) {
                return $item->reference_number ?: ($item->title ?: "#{$item->id}");
            })->take(5)->implode(', ');

            $moreCount = $protectedExpenses->count() > 5 ? ' and ' . ($protectedExpenses->count() - 5) . ' more' : '';
            throw new \DomainException("Cannot delete approved or paid expenses ({$identifiers}{$moreCount}). Only draft or rejected expenses can be deleted.");
        }

        $receipts = $this->repository->getModel()->whereIn('id', $ids)->whereNotNull('receipt')->pluck('receipt')->toArray();
        $this->bulkDeleteStorageFiles($receipts);
        return $this->repository->getModel()->whereIn('id', $ids)->delete();
    }

    public function bulkRestore(array $ids): int
    {
        return $this->repository->getModel()->onlyTrashed()->whereIn('id', $ids)->restore();
    }

    public function restore(int|string $id): bool
    {
        return $this->repository->restore($id);
    }

    public function forceDelete(int|string $id): bool
    {
        $expense = $this->repository->getModel()->withTrashed()->findOrFail($id);

        if (in_array($expense->status, ['approved', 'paid'])) {
            throw new \DomainException("Cannot permanently delete expense #{$id} with status '{$expense->status}'. Only draft or rejected expenses can be deleted.");
        }

        if (!empty($expense->receipt)) {
            $this->deleteStorageFile($expense->receipt);
        }

        return $this->repository->forceDelete($id);
    }
}
