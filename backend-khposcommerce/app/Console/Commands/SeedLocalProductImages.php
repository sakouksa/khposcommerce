<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Product\Product;
use App\Models\Product\ProductImage;

class SeedLocalProductImages extends Command
{
    protected $signature   = 'products:seed-local-images {--force : Re-download master assets even if already cached}';
    protected $description = 'Downloads and stores 4-5 authentic high-res product photos locally, organised into category subfolders';

    // ─── Master High-Resolution Product Photography Pools ─────────────────────
    private array $categoryImagePools = [
        'laptops' => [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
        ],
        'smartphones' => [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80',
        ],
        'monitors' => [
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        ],
        'keyboards' => [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541140532154-b024d705b909?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560762484-813fc97650a0?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1626958390898-162d3577f293?w=800&auto=format&fit=crop&q=80',
        ],
        'audio' => [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
        ],
        'smartwatches' => [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544117518-30df578096a4?w=800&auto=format&fit=crop&q=80',
        ],
        'cameras' => [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1500643752441-4dc90cda350a?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=80',
        ],
        'chargers' => [
            'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1622445262464-84b25e40a6c6?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1609592424365-27a3c3070444?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&auto=format&fit=crop&q=80',
        ],
        'shoes' => [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
        ],
        'apparel' => [
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        ],
    ];

    // ─── Slug → Pool key mapping ───────────────────────────────────────────────
    private function resolvePoolKey(string $catSlug): string
    {
        // Direct match first
        if (isset($this->categoryImagePools[$catSlug])) {
            return $catSlug;
        }

        $map = [
            'smartphones' => ['phone', 'mobile', 'smartphone'],
            'smartwatches' => ['watch', 'smartwatch', 'wearable'],
            'monitors'    => ['monitor', 'screen', 'display'],
            'keyboards'   => ['key', 'board', 'keyboard'],
            'audio'       => ['audio', 'head', 'ear', 'speaker', 'sound'],
            'cameras'     => ['cam', 'camera', 'photo', 'video'],
            'chargers'    => ['char', 'power', 'cable', 'dock', 'hub'],
            'shoes'       => ['shoe', 'sneaker', 'foot', 'boot'],
            'apparel'     => ['apparel', 'cloth', 'shirt', 'wear', 'jacket', 'hoodie'],
            'laptops'     => ['lap', 'comp', 'pc', 'notebook'],
        ];

        foreach ($map as $pool => $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($catSlug, $kw)) {
                    return $pool;
                }
            }
        }

        return 'laptops'; // Default fallback
    }

    public function handle(): int
    {
        $this->info('🚀 Starting Local Product Image Seeder (Category Subfolder Mode)...');
        $this->newLine();

        $force = (bool) $this->option('force');

        // ── Step 1: Prepare category subfolders & download master assets ────────
        $this->info('📦 Step 1/3: Creating category subfolders & downloading master assets...');

        // Ensure cache dir exists
        Storage::disk('public')->makeDirectory('products/cache');

        // Create one subfolder per category slug
        foreach (array_keys($this->categoryImagePools) as $slug) {
            Storage::disk('public')->makeDirectory("products/{$slug}");
        }

        $categoryLocalFiles = [];

        foreach ($this->categoryImagePools as $catKey => $urls) {
            $categoryLocalFiles[$catKey] = [];
            foreach ($urls as $idx => $url) {
                $cacheFile    = "products/cache/{$catKey}_{$idx}.webp";
                $fullDiskPath = Storage::disk('public')->path($cacheFile);

                if (!$force && Storage::disk('public')->exists($cacheFile) && filesize($fullDiskPath) > 5000) {
                    $categoryLocalFiles[$catKey][] = $cacheFile;
                    continue;
                }

                try {
                    $this->line("   Downloading {$catKey} image " . ($idx + 1) . '/' . count($urls) . '...');
                    $response = Http::timeout(15)->withoutVerifying()->get($url);
                    if ($response->successful() && strlen($response->body()) > 2000) {
                        Storage::disk('public')->put($cacheFile, $response->body());
                        $categoryLocalFiles[$catKey][] = $cacheFile;
                    }
                } catch (\Exception $e) {
                    $this->warn("   ⚠️ Failed: {$url} — " . $e->getMessage());
                }
            }
        }

        $this->info('✅ Step 1 Complete: Master pools ready.');
        $this->newLine();

        // ── Step 2: Process each product ─────────────────────────────────────────
        $this->info('🖼️ Step 2/3: Assigning 5 category-organised images per product...');

        $products      = Product::with(['category', 'brand'])->get();
        $totalProducts = $products->count();
        $totalInserted = 0;

        $bar = $this->output->createProgressBar($totalProducts);
        $bar->start();

        foreach ($products as $pIndex => $product) {
            $catSlug  = strtolower($product->category?->slug ?? 'laptops');
            $poolKey  = $this->resolvePoolKey($catSlug);

            $available = $categoryLocalFiles[$poolKey] ?? $categoryLocalFiles['laptops'] ?? [];
            if (empty($available)) {
                $bar->advance();
                continue;
            }

            // Remove existing images to avoid duplicates
            ProductImage::where('product_id', $product->id)->delete();

            $poolCount  = count($available);
            $imageCount = 5;

            for ($imgIdx = 1; $imgIdx <= $imageCount; $imgIdx++) {
                // Rotational pick so different products get different angle combos
                $sourceIdx   = ($pIndex * 3 + $imgIdx - 1) % $poolCount;
                $sourcePath  = $available[$sourceIdx];

                // ── NEW: subfolder path  products/{category-slug}/product_{id}_{n}.webp
                $destPath = "products/{$catSlug}/product_{$product->id}_{$imgIdx}.webp";

                // Copy cached master → product-specific file in its category subfolder
                if (Storage::disk('public')->exists($sourcePath)) {
                    // Ensure the category directory exists (for dynamically created categories)
                    Storage::disk('public')->makeDirectory("products/{$catSlug}");
                    Storage::disk('public')->copy($sourcePath, $destPath);
                }

                ProductImage::create([
                    'product_id' => $product->id,
                    'image'      => $destPath,
                    'thumbnail'  => $destPath,
                    'alt_text'   => "{$product->name} - View {$imgIdx}",
                    'sort_order' => $imgIdx - 1,
                    'is_primary' => ($imgIdx === 1),
                ]);

                $totalInserted++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("🎉 Step 3/3 Complete!");
        $this->info("📁 Images stored in: storage/app/public/products/{category-slug}/");
        $this->info("   • {$totalInserted} images across {$totalProducts} products.");
        $this->line('');
        $this->line('  Structure example:');
        $this->line('    products/');
        $this->line('    ├── laptops/');
        $this->line('    │   ├── product_1_1.webp');
        $this->line('    │   └── product_1_2.webp  ...');
        $this->line('    ├── smartphones/');
        $this->line('    │   └── product_5_1.webp  ...');
        $this->line('    └── cache/  (master downloads)');

        return Command::SUCCESS;
    }
}
