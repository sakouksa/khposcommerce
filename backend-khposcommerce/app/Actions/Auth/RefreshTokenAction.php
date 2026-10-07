<?php

namespace App\Actions\Auth;

use App\Models\User;

class RefreshTokenAction
{
    public function execute(User $user): array
    {
        return [
            'token' => 'refreshed_token_' . bin2hex(random_bytes(24)),
            'token_type' => 'Bearer',
            'expires_in' => 3600 * 24,
        ];
    }
}
