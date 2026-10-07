<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Payment\Payment;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('payment.view');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->hasRole('super_admin') || (int) $user->company_id === (int) $payment->company_id;
    }

    public function create(User $user): bool
    {
        return $user->can('payment.create');
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->can('payment.update') && ((int) $user->company_id === (int) $payment->company_id || $user->hasRole('super_admin'));
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->can('payment.delete') && ((int) $user->company_id === (int) $payment->company_id || $user->hasRole('super_admin'));
    }
}
