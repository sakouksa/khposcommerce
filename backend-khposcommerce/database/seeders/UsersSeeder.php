<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $users = [
            // ─── Super Admin (Cross-Branch System Owner) ─────────────────────
            [
                'email'     => 'superadmin@enterprise-pos.com',
                'username'  => 'superadmin',
                'name'      => 'Super Admin (System Owner)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 71 888 0001',
                'role'      => 'super_admin',
                'branch_id' => 1,
                'branches'  => [1, 2, 3],
            ],

            // ─── Company Primary Owner 👑 ──────────────────────────────────────
            [
                'email'     => 'owner@enterprise-pos.com',
                'username'  => 'owner_sokha',
                'name'      => 'Sokha Heng (Company Owner 👑)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 71 888 0002',
                'role'      => 'owner',
                'branch_id' => 1,
                'branches'  => [1, 2, 3],
            ],

            // ─── សាខា A (HQ - ភ្នំពេញ) ────────────────────────────────────────
            [
                'email'     => 'admin@enterprise-pos.com',
                'username'  => 'admin_a',
                'name'      => 'Vireak Chea (Admin សាខា A)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 71 888 0003',
                'role'      => 'admin',
                'branch_id' => 1,
                'branches'  => [1],
            ],
            [
                'email'     => 'staff1.brancha@enterprise-pos.com',
                'username'  => 'staff1_a',
                'name'      => 'Vannak Chea (Staff 1 - សាខា A)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 93 111 0004',
                'role'      => 'cashier',
                'branch_id' => 1,
                'branches'  => [1],
            ],
            [
                'email'     => 'staff2.brancha@enterprise-pos.com',
                'username'  => 'staff2_a',
                'name'      => 'Sreymom Pich (Staff 2 - សាខា A)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 93 111 0005',
                'role'      => 'cashier',
                'branch_id' => 1,
                'branches'  => [1],
            ],
            [
                'email'     => 'staff3.brancha@enterprise-pos.com',
                'username'  => 'staff3_a',
                'name'      => 'Chanvibol Keo (Staff 3 - សាខា A)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 85 222 0006',
                'role'      => 'warehouse_staff',
                'branch_id' => 1,
                'branches'  => [1],
            ],

            // ─── សាខា B (ត្បូងឃ្មុំ) ───────────────────────────────────────────
            [
                'email'     => 'admin.branchb@enterprise-pos.com',
                'username'  => 'admin_b',
                'name'      => 'Bona Chhim (Admin សាខា B)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 71 888 0020',
                'role'      => 'admin',
                'branch_id' => 2,
                'branches'  => [2],
            ],
            [
                'email'     => 'staff1.branchb@enterprise-pos.com',
                'username'  => 'staff1_b',
                'name'      => 'Kosal Srun (Staff 1 - សាខា B)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 93 111 0021',
                'role'      => 'cashier',
                'branch_id' => 2,
                'branches'  => [2],
            ],
            [
                'email'     => 'staff2.branchb@enterprise-pos.com',
                'username'  => 'staff2_b',
                'name'      => 'Neary Kim (Staff 2 - សាខា B)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 93 111 0022',
                'role'      => 'cashier',
                'branch_id' => 2,
                'branches'  => [2],
            ],
            [
                'email'     => 'staff3.branchb@enterprise-pos.com',
                'username'  => 'staff3_b',
                'name'      => 'Rithy Prom (Staff 3 - សាខា B)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 85 222 0023',
                'role'      => 'warehouse_staff',
                'branch_id' => 2,
                'branches'  => [2],
            ],

            // ─── សាខា C (សៀមរាប) ───────────────────────────────────────────
            [
                'email'     => 'admin.branchc@enterprise-pos.com',
                'username'  => 'admin_c',
                'name'      => 'Chantrea Nuon (Admin សាខា C)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 71 888 0030',
                'role'      => 'admin',
                'branch_id' => 3,
                'branches'  => [3],
            ],
            [
                'email'     => 'staff1.branchc@enterprise-pos.com',
                'username'  => 'staff1_c',
                'name'      => 'Dany Sam (Staff 1 - សាខា C)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 93 111 0031',
                'role'      => 'cashier',
                'branch_id' => 3,
                'branches'  => [3],
            ],
            [
                'email'     => 'staff2.branchc@enterprise-pos.com',
                'username'  => 'staff2_c',
                'name'      => 'Visoth Long (Staff 2 - សាខា C)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 93 111 0032',
                'role'      => 'cashier',
                'branch_id' => 3,
                'branches'  => [3],
            ],
            [
                'email'     => 'staff3.branchc@enterprise-pos.com',
                'username'  => 'staff3_c',
                'name'      => 'Thida Ouk (Staff 3 - សាខា C)',
                'password'  => Hash::make('password'),
                'phone'     => '+855 85 222 0033',
                'role'      => 'warehouse_staff',
                'branch_id' => 3,
                'branches'  => [3],
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            $branchList = $userData['branches'] ?? [$userData['branch_id']];
            unset($userData['role'], $userData['branches']);

            $user = User::withTrashed()->where('email', $userData['email'])->first();

            if ($user) {
                $user->restore();
                $user->update(array_merge([
                    'company_id' => $company?->id ?? 1,
                    'is_active'  => true,
                ], $userData));
            } else {
                // If username is taken, update username
                $existingUsername = User::withTrashed()->where('username', $userData['username'])->first();
                if ($existingUsername) {
                    $existingUsername->update(['username' => $userData['username'] . '_' . time()]);
                }

                $user = User::create(array_merge([
                    'company_id' => $company?->id ?? 1,
                    'is_active'  => true,
                ], $userData));
            }

            if ($role) {
                $user->syncRoles([$role]);
            }

            // Sync user branches in user_branches pivot
            $pivotData = [];
            foreach ($branchList as $bId) {
                $pivotData[$bId] = [
                    'is_active'  => true,
                    'is_default' => ($bId == $userData['branch_id']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $user->branches()->sync($pivotData);
        }

        $this->command->info('3-Branch Enterprise Users & Admins (Branch A, B, C) seeded successfully.');
    }
}
