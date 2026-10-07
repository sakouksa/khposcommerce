<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterAction
{
    public function execute(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        return User::create($data);
    }
}
