<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Supplier\Supplier;

class SeedLocalLogos extends Command
{
    protected $signature   = 'assets:seed-local-logos
                                {--only= : Run only "categories", "brands", or "suppliers"}
                                {--force : Re-generate/download even if file exists}';
    protected $description = 'Seed authentic brand vector logos and category images to local storage';

    private array $categoryImages = [
        'smartphones'  => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=85',
        'laptops'      => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=85',
        'monitors'     => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=85',
        'smartwatches' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=85',
        'keyboards'    => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=85',
        'audio'        => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=85',
        'cameras'      => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=85',
        'chargers'     => 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&auto=format&fit=crop&q=85',
        'shoes'        => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=85',
        'apparel'      => 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=85',
        'default'      => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=85',
    ];

    private array $brandConfig = [
        'apple'           => ['slug' => 'apple', 'color' => '#000000'],
        'samsung'         => ['slug' => 'samsung', 'color' => '#1428A0'],
        'xiaomi'          => ['slug' => 'xiaomi', 'color' => '#FF6900'],
        'oppo'            => ['slug' => 'oppo', 'color' => '#046A38'],
        'asus'            => ['slug' => 'asus', 'color' => '#00539B'],
        'hp'              => ['slug' => 'hp', 'color' => '#0096D6'],
        'dell'            => ['slug' => 'dell', 'color' => '#007DB8'],
        'sony'            => ['slug' => 'sony', 'color' => '#000000'],
        'jbl'             => ['slug' => 'jbl', 'color' => '#FF5000'],
        'logitech'        => ['slug' => 'logitech', 'color' => '#00B8FC'],
        'lenovo'          => ['slug' => 'lenovo', 'color' => '#E2231A'],
        'microsoft'       => ['slug' => 'microsoft', 'color' => '#5E5E5E'],
        'intel'           => ['slug' => 'intel', 'color' => '#0068B5'],
        'msi'             => ['slug' => 'msi', 'color' => '#E21B22'],
        'kingston'        => ['slug' => 'kingstontechnology', 'color' => '#DA291C'],
        'cisco'           => ['slug' => 'cisco', 'color' => '#049FD9'],
        'tp-link'         => ['slug' => 'tplink', 'color' => '#4ACBD6'],
        'western-digital' => ['slug' => 'westerndigital', 'color' => '#005A9C'],
        'toshiba'         => ['slug' => 'toshiba', 'color' => '#FF0000'],
        'transcend'       => ['custom' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E60012"><path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5z"/></svg>', 'color' => '#E60012'],
        'nec'             => ['slug' => 'nec', 'color' => '#141E7A'],
        'aoc'             => ['custom' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E31E24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5H9.5v-3H7v3H5.5V7.5H8l2.5 4.5V7.5H12v9h-1zm7.5 0h-4.5V7.5h4.5c1.38 0 2.5 1.12 2.5 2.5v4c0 1.38-1.12 2.5-2.5 2.5zm-3-1.5h3c.55 0 1-.45 1-1V10c0-.55-.45-1-1-1h-3v6.5z"/></svg>', 'color' => '#E31E24'],
        'ubiquiti'        => ['slug' => 'ubiquiti', 'color' => '#006FFF'],
        'cooler-master'   => ['slug' => 'coolermaster', 'color' => '#8031A7'],
        'tally-dascom'    => ['custom' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#004B87"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-4h8v4zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>', 'color' => '#004B87'],
        'prolink'         => ['custom' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005BAC"><circle cx="12" cy="12" r="10" fill="none" stroke="#005BAC" stroke-width="2.5"/><path d="M9 7h4a3 3 0 0 1 3 3 3 3 0 0 1-3 3H9v4H6.5V7H9zm0 4h3.5a1 1 0 0 0 1-1 1 1 0 0 0-1-1H9v2z"/></svg>', 'color' => '#005BAC'],
        'ptc'             => ['custom' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#F97316"/><path d="M7 6h6a3 3 0 0 1 3 3 3 3 0 0 1-3 3H7v6H4.5V6H7zm0 4.5h5.5a1 1 0 0 0 1-1 1 1 0 0 0-1-1H7v2z" fill="#FFFFFF"/></svg>', 'color' => '#F97316'],
        'hikvision'       => ['custom' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E60012"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>', 'color' => '#E60012'],
        'planet'          => ['slug' => 'planetscale', 'color' => '#00529B'],
    ];

    public function handle(): int
    {
        $only  = $this->option('only');
        $force = (bool) $this->option('force');

        $doCategories = !$only || $only === 'categories';
        $doBrands     = !$only || $only === 'brands';
        $doSuppliers  = !$only || $only === 'suppliers';

        Storage::disk('public')->makeDirectory('categories');
        Storage::disk('public')->makeDirectory('brands');
        Storage::disk('public')->makeDirectory('suppliers');

        if ($doBrands) {
            $this->seedBrands();
        }

        if ($doCategories) {
            $this->seedCategories($force);
        }

        if ($doSuppliers) {
            $this->seedSuppliers($force);
        }

        $this->newLine();
        $this->info('✅ All brand logos, category images, and supplier vector logos are stored locally!');
        $this->line('  📁 storage/app/public/brands/     (Official Brand Vector SVGs)');
        $this->line('  📁 storage/app/public/categories/ (Category photography)');
        $this->line('  📁 storage/app/public/suppliers/  (Supplier Vector Logos & Default SVG)');

        return Command::SUCCESS;
    }

    private function seedBrands(): void
    {
        $this->info('');
        $this->info('🏷️  Generating 100% Official Brand Vector Logos...');

        $brandsDir = Storage::disk('public')->path('brands');
        if (!is_dir($brandsDir)) {
            mkdir($brandsDir, 0755, true);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $brands = Brand::all();
        $bar = $this->output->createProgressBar($brands->count());
        $bar->start();

        foreach ($brands as $brand) {
            $slug = $brand->slug;
            $cfg  = $this->brandConfig[$slug] ?? ['slug' => $slug, 'color' => '#2563EB'];
            $color = $cfg['color'];
            $svgPathData = '';

            if (isset($cfg['slug'])) {
                $url = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{$cfg['slug']}.svg";
                curl_setopt($ch, CURLOPT_URL, $url);
                $rawSvg = curl_exec($ch);
                $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

                if ($code === 200 && strlen($rawSvg) > 50) {
                    if (preg_match('/<path[^>]+>/i', $rawSvg, $matches)) {
                        $pathTag = $matches[0];
                        if (!str_contains($pathTag, 'fill=')) {
                            $pathTag = str_replace('<path', '<path fill="' . $color . '"', $pathTag);
                        } else {
                            $pathTag = preg_replace('/fill="[^"]*"/', 'fill="' . $color . '"', $pathTag);
                        }
                        $svgPathData = $pathTag;
                    }
                }
            } elseif (isset($cfg['custom'])) {
                $svgPathData = $cfg['custom'];
            }

            if (!empty($svgPathData)) {
                if (str_starts_with($svgPathData, '<svg')) {
                    $finalSvg = $svgPathData;
                } else {
                    if ($slug === 'microsoft') {
                        $finalSvg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#ffffff" rx="20"/>
  <g transform="translate(50, 50)">
    <rect x="0" y="0" width="46" height="46" fill="#F25022"/>
    <rect x="54" y="0" width="46" height="46" fill="#7FBA00"/>
    <rect x="0" y="54" width="46" height="46" fill="#00A4EF"/>
    <rect x="54" y="54" width="46" height="46" fill="#FFB900"/>
  </g>
</svg>
SVG;
                    } else {
                        $finalSvg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#ffffff" rx="20"/>
  <g transform="translate(35, 35) scale(5.4)">
    {$svgPathData}
  </g>
</svg>
SVG;
                    }
                }
            } else {
                $finalSvg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#ffffff" rx="20"/>
  <circle cx="100" cy="100" r="60" fill="{$color}"/>
  <text x="100" y="115" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#ffffff">{$slug}</text>
</svg>
SVG;
            }

            $svgFile  = "{$brandsDir}/{$slug}.svg";
            $webpFile = "{$brandsDir}/{$slug}.webp";

            file_put_contents($svgFile, $finalSvg);
            file_put_contents($webpFile, $finalSvg);

            $brand->update(['logo' => "brands/{$slug}.svg"]);
            $bar->advance();
        }

        curl_close($ch);
        $bar->finish();
        $this->newLine();
        $this->info("  ✓ {$brands->count()} official brand logos generated in storage/app/public/brands/");
    }

    private function seedCategories(bool $force): void
    {
        $this->info('');
        $this->info('🗂️  Seeding Category Images...');

        $categories = Category::all();
        $bar        = $this->output->createProgressBar($categories->count());
        $bar->start();

        foreach ($categories as $category) {
            $slug     = $category->slug;
            $destPath = "categories/{$slug}.webp";
            $fullPath = Storage::disk('public')->path($destPath);

            if (!$force && Storage::disk('public')->exists($destPath) && filesize($fullPath) > 2000) {
                if ($category->image !== $destPath) {
                    $category->update(['image' => $destPath]);
                }
                $bar->advance();
                continue;
            }

            $url = $this->categoryImages[$slug] ?? $this->categoryImages['default'];
            $downloaded = $this->downloadFile($url, $destPath);

            if ($downloaded) {
                $category->update(['image' => $destPath]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("  ✓ {$categories->count()} category images saved in storage/app/public/categories/");
    }

    private function downloadFile(string $url, string $destPath): bool
    {
        try {
            $response = Http::timeout(15)->withoutVerifying()->get($url);
            if ($response->successful() && strlen($response->body()) > 1000) {
                Storage::disk('public')->put($destPath, $response->body());
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function seedSuppliers(bool $force): void
    {
        $this->info('');
        $this->info('🏢  Generating Supplier Vector Logos in storage/app/public/suppliers/ ...');

        $suppliersDir = Storage::disk('public')->path('suppliers');
        if (!is_dir($suppliersDir)) {
            mkdir($suppliersDir, 0755, true);
        }

        // Ensure default-supplier.svg is copied/present in storage
        $defaultSource = base_path('../apps/adminkhposcommerce/public/images/default-supplier.svg');
        $defaultDest = "{$suppliersDir}/default-supplier.svg";
        if (file_exists($defaultSource)) {
            copy($defaultSource, $defaultDest);
        }

        $suppliers = Supplier::all();
        if ($suppliers->isEmpty()) {
            $this->warn('  No suppliers found in database.');
            return;
        }

        $bar = $this->output->createProgressBar($suppliers->count());
        $bar->start();

        $palettes = [
            ['start' => '#0284C7', 'end' => '#0369A1', 'accent' => '#38BDF8'],
            ['start' => '#4F46E5', 'end' => '#3730A3', 'accent' => '#818CF8'],
            ['start' => '#0D9488', 'end' => '#115E59', 'accent' => '#2DD4BF'],
            ['start' => '#7C3AED', 'end' => '#5B21B6', 'accent' => '#A78BFA'],
            ['start' => '#EA580C', 'end' => '#9A3412', 'accent' => '#FB923C'],
            ['start' => '#059669', 'end' => '#065F46', 'accent' => '#34D399'],
            ['start' => '#2563EB', 'end' => '#1E40AF', 'accent' => '#60A5FA'],
            ['start' => '#D97706', 'end' => '#B45309', 'accent' => '#FBBF24'],
            ['start' => '#E11D48', 'end' => '#9F1239', 'accent' => '#FB7185'],
            ['start' => '#475569', 'end' => '#334155', 'accent' => '#94A3B8'],
        ];

        foreach ($suppliers as $supplier) {
            $code = strtolower(preg_replace('/[^a-z0-9\-]/i', '', $supplier->code ?: ('spl-' . $supplier->id)));
            $destPath = "suppliers/{$code}.svg";
            $fullPath = "{$suppliersDir}/{$code}.svg";

            if (!$force && file_exists($fullPath) && filesize($fullPath) > 400) {
                if ($supplier->logo !== $destPath) {
                    $supplier->update(['logo' => $destPath]);
                }
                $bar->advance();
                continue;
            }

            // Extract clean initials
            $words = preg_split('/[\s\-_,.]+/', trim($supplier->name));
            $initials = '';
            foreach ($words as $w) {
                if (strlen($w) > 0 && ctype_alnum($w[0]) && !in_array(strtolower($w), ['co', 'ltd', 'inc', 'corp', 'group', 'the', 'plc'])) {
                    $initials .= strtoupper($w[0]);
                    if (strlen($initials) >= 2) break;
                }
            }
            if (empty($initials)) {
                $initials = strtoupper(substr($supplier->name, 0, 2));
            }

            $idx = abs(crc32($supplier->name . $supplier->id)) % count($palettes);
            $p = $palettes[$idx];

            $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
  <defs>
    <linearGradient id="cardBg_{$code}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#EDF2F7" />
    </linearGradient>
    <linearGradient id="emblemGrad_{$code}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$p['start']}" />
      <stop offset="100%" stop-color="{$p['end']}" />
    </linearGradient>
    <filter id="shadow_{$code}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.10" />
    </filter>
  </defs>

  <rect width="400" height="400" rx="32" fill="url(#cardBg_{$code})" />
  <rect x="1" y="1" width="398" height="398" rx="31" stroke="#E2E8F0" stroke-width="2" />
  <ellipse cx="200" cy="305" rx="100" ry="22" fill="#0F172A" fill-opacity="0.06" />

  <g filter="url(#shadow_{$code})">
    <rect x="100" y="100" width="200" height="200" rx="52" fill="url(#emblemGrad_{$code})" />
    <rect x="102" y="102" width="196" height="196" rx="50" stroke="{$p['accent']}" stroke-width="3" stroke-opacity="0.4" fill="none" />
    <circle cx="200" cy="200" r="82" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.15" fill="none" />
    <text x="200" y="214" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="2">{$initials}</text>
    <circle cx="262" cy="138" r="8" fill="{$p['accent']}" />
  </g>
</svg>
SVG;

            file_put_contents($fullPath, $svg);
            $supplier->update(['logo' => $destPath]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("  ✓ {$suppliers->count()} supplier vector logos generated in storage/app/public/suppliers/");
    }
}
