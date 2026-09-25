<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseImageSeeder extends Seeder
{
    public function run(): void
    {
        $script = base_path('generate_demo_images.php');
        if (file_exists($script)) {
            require $script;
        } else {
            $this->command->error("generate_demo_images.php script not found.");
        }
    }
}
