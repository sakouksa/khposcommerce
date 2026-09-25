<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Branch;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $branchId = Branch::value('id') ?? 1;

        // 1. Departments
        $deptNames = [
            'Executive & Management',
            'Human Resources',
            'Finance & Accounting',
            'Sales & POS Retail',
            'E-Commerce & Digital',
            'Warehouse & Logistics',
            'Delivery & Dispatch',
            'Customer Support',
            'Information Technology',
            'Procurement & Supply',
        ];
        foreach ($deptNames as $i => $name) {
            DB::table('departments')->updateOrInsert(
                ['id' => $i + 1],
                [
                    'company_id'  => $companyId,
                    'branch_id'   => $branchId,
                    'name'        => $name,
                    'code'        => 'DEPT-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 4)),
                    'description' => "Department of $name",
                    'is_active'   => true,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]
            );
        }

        // 2. Positions
        $posDefinitions = [
            ['name' => 'General Manager', 'dept' => 1, 'code' => 'GM-01'],
            ['name' => 'HR Manager', 'dept' => 2, 'code' => 'HR-01'],
            ['name' => 'Chief Accountant', 'dept' => 3, 'code' => 'ACC-01'],
            ['name' => 'POS Store Supervisor', 'dept' => 4, 'code' => 'POS-SUP'],
            ['name' => 'Senior Cashier', 'dept' => 4, 'code' => 'CSH-01'],
            ['name' => 'E-Commerce Specialist', 'dept' => 5, 'code' => 'ECOM-01'],
            ['name' => 'Warehouse Supervisor', 'dept' => 6, 'code' => 'WH-SUP'],
            ['name' => 'Order Picker & Packer', 'dept' => 6, 'code' => 'WH-PKR'],
            ['name' => 'Senior Delivery Rider', 'dept' => 7, 'code' => 'DVR-01'],
            ['name' => 'Customer Support Lead', 'dept' => 8, 'code' => 'SUP-01'],
        ];

        foreach ($posDefinitions as $i => $pos) {
            DB::table('positions')->updateOrInsert(
                ['id' => $i + 1],
                [
                    'company_id'    => $companyId,
                    'department_id' => $pos['dept'],
                    'name'          => $pos['name'],
                    'code'          => 'POS-' . $pos['code'],
                    'description'   => "Position of {$pos['name']}",
                    'is_active'     => true,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            );
        }

        // 3. Employees
        $genders = ['female', 'male'];
        $photos = [
            1  => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
            2  => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
            3  => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
            4  => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
            5  => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
            6  => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
            7  => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
            8  => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
            9  => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
            10 => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
            11 => 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256',
            12 => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256',
            13 => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=256',
            14 => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
            15 => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
        ];

        $salaryPresets = [
            1  => 2500.00, // GM
            2  => 1200.00, // HR
            3  => 1400.00, // Accountant
            4  => 900.00,  // POS Supervisor
            5  => 450.00,  // Cashier 1
            6  => 450.00,  // Cashier 2
            7  => 700.00,  // Ecom
            8  => 850.00,  // WH Sup
            9  => 380.00,  // Picker 1
            10 => 380.00,  // Picker 2
            11 => 400.00,  // Rider 1
            12 => 400.00,  // Rider 2
            13 => 550.00,  // Support
            14 => 650.00,  // IT Support
            15 => 600.00,  // Procurement
        ];

        $employeeProfiles = [
            1  => ['name' => 'Chhorn Sreyleak', 'gender' => 'female', 'email' => 'sreyleak.chhorn@nextech-cambodia.com', 'phone' => '+855 12 888 101'],
            2  => ['name' => 'Heng Piseth',     'gender' => 'male',   'email' => 'piseth.heng@nextech-cambodia.com',     'phone' => '+855 12 888 102'],
            3  => ['name' => 'Meas Sreypov',    'gender' => 'female', 'email' => 'sreypov.meas@nextech-cambodia.com',    'phone' => '+855 12 888 103'],
            4  => ['name' => 'Chan Vanna',      'gender' => 'male',   'email' => 'vanna.chan@nextech-cambodia.com',      'phone' => '+855 12 888 104'],
            5  => ['name' => 'Vannak Chea',     'gender' => 'male',   'email' => 'vannak.chea@nextech-cambodia.com',     'phone' => '+855 93 111 0004'],
            6  => ['name' => 'Sreymom Pich',    'gender' => 'female', 'email' => 'sreymom.pich@nextech-cambodia.com',    'phone' => '+855 93 111 0005'],
            7  => ['name' => 'Nuon Chantrea',   'gender' => 'female', 'email' => 'chantrea.nuon@nextech-cambodia.com',   'phone' => '+855 12 888 107'],
            8  => ['name' => 'Chanvibol Keo',   'gender' => 'male',   'email' => 'chanvibol.keo@nextech-cambodia.com',   'phone' => '+855 85 222 0006'],
            9  => ['name' => 'Visal Prak',      'gender' => 'male',   'email' => 'visal.prak@nextech-cambodia.com',      'phone' => '+855 85 222 0007'],
            10 => ['name' => 'Bun Rotha',       'gender' => 'male',   'email' => 'rotha.bun@nextech-cambodia.com',       'phone' => '+855 12 888 110'],
            11 => ['name' => 'Sok Dara',        'gender' => 'male',   'email' => 'dara.sok@nextech-cambodia.com',        'phone' => '+855 12 888 111'],
            12 => ['name' => 'Kim Seng',        'gender' => 'male',   'email' => 'seng.kim@nextech-cambodia.com',        'phone' => '+855 12 888 112'],
            13 => ['name' => 'Khim Malis',      'gender' => 'female', 'email' => 'malis.khim@nextech-cambodia.com',      'phone' => '+855 12 888 113'],
            14 => ['name' => 'Tep Rithy',       'gender' => 'male',   'email' => 'rithy.tep@nextech-cambodia.com',       'phone' => '+855 12 888 114'],
            15 => ['name' => 'Chea Sothea',     'gender' => 'male',   'email' => 'sothea.chea@nextech-cambodia.com',     'phone' => '+855 12 888 115'],
        ];

        for ($i = 1; $i <= 15; $i++) {
            $isPosSup = in_array($i, [1, 4]);
            $isCashier = in_array($i, [4, 5, 6]);
            $isDriver = in_array($i, [11, 12]);
            $isPicker = in_array($i, [9, 10]);
            $profile = $employeeProfiles[$i];

            DB::table('employees')->updateOrInsert(
                ['id' => $i],
                [
                    'company_id'            => $companyId,
                    'branch_id'             => $branchId,
                    'department_id'         => min(10, (int) ceil($i / 1.5)),
                    'position_id'           => min(10, $i),
                    'reporting_to_id'       => $i === 1 ? null : ($i <= 4 ? 1 : ($isCashier ? 4 : ($isDriver ? 8 : 2))),
                    'user_id'               => $i <= 10 ? $i : null,
                    'employee_number'       => 'EMP-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'name'                  => $profile['name'],
                    'email'                 => $profile['email'],
                    'phone'                 => $profile['phone'],
                    'nik'                   => 'KH-0' . str_pad($i * 7891, 8, '0', STR_PAD_LEFT),
                    'gender'                => $profile['gender'],
                    'birth_date'            => '199' . ($i % 9) . '-0' . (($i % 9) + 1) . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'address'               => "Street 271, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh #" . ($i * 12),
                    'photo'                 => $photos[$i] ?? null,
                    'join_date'             => '2024-01-15',
                    'resign_date'           => null,
                    'contract_type'         => $i > 13 ? 'probation' : ($i > 10 ? 'fdc' : 'udc'),
                    'contract_end_date'     => $i > 10 ? '2026-12-31' : null,
                    'status'                => 'active',
                    'basic_salary'          => $salaryPresets[$i] ?? 450.00,
                    // POS & Security
                    'pos_pin'               => str_pad($i * 1111 % 10000, 4, '0', STR_PAD_LEFT), // e.g. 1111, 2222
                    'card_uid'              => 'RFID-KH-' . str_pad($i * 37, 5, '0', STR_PAD_LEFT),
                    'sales_commission_rate' => $isCashier ? 2.50 : 0.00,
                    'is_pos_supervisor'     => $isPosSup,
                    'can_override_discount' => $isPosSup,
                    'can_void_sale'         => $isPosSup,
                    // E-Commerce & Logistics
                    'is_driver'             => $isDriver,
                    'driver_license_no'     => $isDriver ? 'DL-KH-' . str_pad($i * 444, 6, '0', STR_PAD_LEFT) : null,
                    'vehicle_plate_no'      => $isDriver ? 'PP-1AB-' . str_pad($i * 1234 % 9000 + 1000, 4, '0', STR_PAD_LEFT) : null,
                    'driver_status'         => $isDriver ? ($i === 11 ? 'available' : 'delivering') : 'available',
                    'is_fulfillment_picker' => $isPicker,
                    // Cambodia Banking & NSSF
                    'bank_name'             => 'ABA Bank',
                    'bank_account_number'   => '000 ' . str_pad($i * 123, 3, '0', STR_PAD_LEFT) . ' ' . str_pad($i * 456, 3, '0', STR_PAD_LEFT),
                    'bank_account_holder'   => strtoupper($profile['name']),
                    'nssf_number'           => 'NSSF-' . str_pad($i * 88392, 7, '0', STR_PAD_LEFT),
                    'has_nssf'              => true,
                    'dependents_count'      => $i % 3,
                    'created_at'            => now(),
                    'updated_at'            => now(),
                ]
            );
        }

        // 4. Leave Balances & Leave Requests
        DB::table('leave_balances')->delete();
        for ($empId = 1; $empId <= 15; $empId++) {
            DB::table('leave_balances')->insert([
                'company_id'            => $companyId,
                'employee_id'           => $empId,
                'year'                  => (int) now()->year,
                'annual_leave_total'    => 18.0,
                'annual_leave_used'     => rand(0, 4),
                'sick_leave_total'      => 15.0,
                'sick_leave_used'       => rand(0, 2),
                'special_leave_total'   => 7.0,
                'special_leave_used'    => 0.0,
                'maternity_leave_total' => 90.0,
                'maternity_leave_used'  => 0.0,
                'created_at'            => now(),
                'updated_at'            => now(),
            ]);
        }

        DB::table('leave_requests')->delete();
        $sampleLeaves = [
            [
                'company_id'    => $companyId,
                'branch_id'     => $branchId,
                'employee_id'   => 5,
                'leave_type'    => 'annual',
                'start_date'    => now()->addDays(3)->format('Y-m-d'),
                'end_date'      => now()->addDays(5)->format('Y-m-d'),
                'total_days'    => 3.0,
                'reason'        => 'Annual vacation trip to Siem Reap',
                'status'        => 'approved',
                'approved_by'   => 1,
                'approved_at'   => now(),
                'manager_notes' => 'Approved. Enjoy your leave!',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'company_id'    => $companyId,
                'branch_id'     => $branchId,
                'employee_id'   => 9,
                'leave_type'    => 'sick',
                'start_date'    => now()->subDays(2)->format('Y-m-d'),
                'end_date'      => now()->subDays(1)->format('Y-m-d'),
                'total_days'    => 2.0,
                'reason'        => 'Flu and fever with doctor certificate',
                'status'        => 'approved',
                'approved_by'   => 1,
                'approved_at'   => now()->subDays(2),
                'manager_notes' => 'Get well soon',
                'created_at'    => now()->subDays(2),
                'updated_at'    => now()->subDays(2),
            ],
            [
                'company_id'    => $companyId,
                'branch_id'     => $branchId,
                'employee_id'   => 11,
                'leave_type'    => 'special',
                'start_date'    => now()->addDays(7)->format('Y-m-d'),
                'end_date'      => now()->addDays(8)->format('Y-m-d'),
                'total_days'    => 2.0,
                'reason'        => 'Brother wedding ceremony in Kampong Cham',
                'status'        => 'pending',
                'approved_by'   => null,
                'approved_at'   => null,
                'manager_notes' => null,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]
        ];
        DB::table('leave_requests')->insert($sampleLeaves);

        // 5. Attendance (Last 10 days)
        DB::table('attendance')->delete();
        $attendance = [];
        $states = ['present', 'present', 'present', 'present', 'late', 'absent'];
        $dateStart = now()->subDays(10);
        for ($day = 0; $day < 10; $day++) {
            $dateStr = $dateStart->copy()->addDays($day)->format('Y-m-d');
            for ($empId = 1; $empId <= 15; $empId++) {
                $status = $states[rand(0, 5)];
                $checkIn = $status === 'absent' ? null : ($status === 'late' ? '08:45:00' : '08:00:00');
                $checkOut = $status === 'absent' ? null : '17:00:00';
                $lateMins = $status === 'late' ? 45 : 0;
                $otMins = ($empId <= 6 && $status === 'present') ? 60 : 0;
                $workedMins = $status === 'absent' ? 0 : (480 + $otMins - $lateMins);

                $attendance[] = [
                    'company_id'          => $companyId,
                    'branch_id'           => $branchId,
                    'employee_id'         => $empId,
                    'attendance_date'     => $dateStr,
                    'date'                => $dateStr,
                    'check_in'            => $checkIn,
                    'check_out'           => $checkOut,
                    'late_minutes'        => $lateMins,
                    'worked_minutes'      => $workedMins,
                    'overtime_minutes'    => $otMins,
                    'status'              => $status,
                    'notes'               => $status === 'late' ? 'Heavy traffic' : null,
                    'created_at'          => now(),
                    'updated_at'          => now(),
                ];
            }
        }
        DB::table('attendance')->insert($attendance);

        // 6. Payrolls (Recent months: 2026-07 and 2026-08)
        DB::table('payrolls')->delete();
        $payrollService = app(\App\Services\Employee\PayrollService::class);
        $payrollService->autoGenerateMonthlyPayroll('2026-07', $companyId, $branchId);
        $payrollService->autoGenerateMonthlyPayroll('2026-08', $companyId, $branchId);

        // Mark July payrolls as paid
        DB::table('payrolls')->where('period_month', '2026-07')->update([
            'status'  => 'paid',
            'paid_at' => '2026-07-25',
        ]);
    }
}
