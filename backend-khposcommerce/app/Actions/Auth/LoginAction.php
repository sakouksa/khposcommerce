<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginAction
{
    public function execute(string $usernameOrEmail, string $password): User
    {
        $user = User::where('email', $usernameOrEmail)
            ->orWhere('phone', $usernameOrEmail)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'credentials' => [__('auth.failed')],
            ]);
        }

        return $user;
    }
}
