<?php

namespace App\Policies\Auth;

use App\Models\User;

class ProfilePolicy
{
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }
}
