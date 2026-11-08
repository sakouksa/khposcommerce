<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetPasswordAction
{
    public function execute(User $user, string $newPassword): bool
    {
        return $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }
}
