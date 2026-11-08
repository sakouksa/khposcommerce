<?php

namespace App\Actions\Auth;

use App\Models\User;

class LogoutAction
{
    public function execute(User $user): bool
    {
        // Revoke current user token or session
        if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return true;
    }
}
