<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Product\ProductImage;

class StorageCleanupProductsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:cleanup-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up unused product images from physical storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting product storage cleanup...');
        
        if (!Storage::disk('public')->exists('products')) {
            $this->warn('No products folder found in storage.');
            return 0;
        }

        $files = Storage::disk('public')->allFiles('products');
        $deletedCount = 0;

        foreach ($files as $file) {
            // Relative path starts with e.g. "products/1/..." or "products/1/thumbs/..."
            // If it's a thumbnail (contains /thumbs/), its corresponding primary image path is:
            $isThumb = str_contains($file, '/thumbs/');
            $dbPath = $file;
            if ($isThumb) {
                $dbPath = str_replace('/thumbs/', '/', $file);
            }

            // Check if this image path exists in the product_images table
            $exists = ProductImage::where('image', $dbPath)->exists();

            if (!$exists) {
                // Not in database, delete the file!
                Storage::disk('public')->delete($file);
                $this->line("Deleted unused file: {$file}");
                $deletedCount++;
            }
        }

        // Also clean up any empty folders inside products directory
        $directories = Storage::disk('public')->allDirectories('products');
        // Sort directories by depth descending so we clean nested subdirectories first
        usort($directories, function ($a, $b) {
            return substr_count($b, '/') <=> substr_count($a, '/');
        });

        foreach ($directories as $dir) {
            if (empty(Storage::disk('public')->allFiles($dir))) {
                Storage::disk('public')->deleteDirectory($dir);
                $this->line("Deleted empty directory: {$dir}");
            }
        }

        $this->info("Cleanup complete. Deleted {$deletedCount} unused file(s).");
        return 0;
    }
}
