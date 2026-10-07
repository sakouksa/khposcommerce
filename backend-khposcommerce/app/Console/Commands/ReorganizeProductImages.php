<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Product\Product;
use App\Models\Product\ProductImage;

class ReorganizeProductImages extends Command
{
    protected $signature   = 'products:reorganize-images {--dry-run : Preview changes without moving files}';
    protected $description = 'Reorganize product images into category-based subfolders: products/{category-slug}/product_{id}_{n}.webp';

    public function handle(): int
    {
        $isDry = $this->option('dry-run');

        $this->info($isDry
            ? '🔍 DRY RUN — No files will be moved'
            : '🚀 Reorganizing product images into category subfolders...'
        );
        $this->newLine();

        // Load all products with their category and images
        $products = Product::with(['category', 'images'])->get();

        if ($products->isEmpty()) {
            $this->warn('No products found.');
            return 0;
        }

        $moved   = 0;
        $skipped = 0;
        $errors  = 0;

        $bar = $this->output->createProgressBar($products->count());
        $bar->start();

        foreach ($products as $product) {
            $categorySlug = $product->category?->slug ?? 'uncategorized';

            foreach ($product->images as $image) {
                $oldPath = $image->image; // e.g. "products/product_1_1.webp"

                if (empty($oldPath)) {
                    $skipped++;
                    continue;
                }

                // Strip leading "storage/" if present
                $cleanOld = ltrim(preg_replace('#^storage/#', '', $oldPath), '/');

                // e.g. "products/product_1_1.webp" → filename = "product_1_1.webp"
                $filename = basename($cleanOld);

                // New relative path inside storage/app/public:
                // products/{category-slug}/{filename}
                $newRelative = "products/{$categorySlug}/{$filename}";

                // Skip if already in correct location
                if ($cleanOld === $newRelative) {
                    $skipped++;
                    continue;
                }

                if ($isDry) {
                    $this->line("  [DRY] {$cleanOld}  →  {$newRelative}");
                    $moved++;
                    continue;
                }

                // Check source exists in public disk
                if (!Storage::disk('public')->exists($cleanOld)) {
                    $this->warn("  ⚠ Missing: {$cleanOld}");
                    $errors++;
                    continue;
                }

                // Create destination directory
                $destDir = "products/{$categorySlug}";
                if (!Storage::disk('public')->exists($destDir)) {
                    Storage::disk('public')->makeDirectory($destDir);
                }

                // Copy file to new location
                $sourceFullPath = Storage::disk('public')->path($cleanOld);
                $destFullPath   = Storage::disk('public')->path($newRelative);

                if (!copy($sourceFullPath, $destFullPath)) {
                    $this->error("  ✗ Failed to copy: {$cleanOld}");
                    $errors++;
                    continue;
                }

                // Delete old file
                Storage::disk('public')->delete($cleanOld);

                // Update DB record
                $image->update(['image' => $newRelative]);

                $moved++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if ($isDry) {
            $this->info("✅ DRY RUN complete — {$moved} files would be moved, {$skipped} already correct.");
        } else {
            $this->info("✅ Done! Moved: {$moved} | Skipped (already correct): {$skipped} | Errors: {$errors}");

            // Clean up empty product root folder if needed
            $this->cleanupEmptyDirs();

            // Clear route cache so URLs refresh
            $this->call('cache:clear');
        }

        return 0;
    }

    /**
     * Remove any empty directories left after moving files.
     */
    private function cleanupEmptyDirs(): void
    {
        $basePath = Storage::disk('public')->path('products');

        if (!is_dir($basePath)) {
            return;
        }

        // Only check files directly in products/ (not in subfolders)
        $files = glob($basePath . '/*.webp');
        if (empty($files)) {
            $this->line('  🧹 No orphan files in products/ root.');
        } else {
            $this->warn('  ⚠ ' . count($files) . ' files remain in products/ root (may need manual check).');
        }
    }
}
