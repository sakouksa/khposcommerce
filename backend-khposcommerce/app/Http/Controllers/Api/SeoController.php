<?php

namespace App\Http\Controllers\Api;

use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\CMS\Blog;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SeoController
{
    // ─────────────────────────────────────────────────────────────────────────
    // GET /robots.txt
    // ─────────────────────────────────────────────────────────────────────────

    public function robots(): Response
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://enterprise-pos-api.onrender.com'));
        $sitemapUrl  = url('/sitemap.xml');

        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            '',
            '# Private / Non-indexable paths',
            'Disallow: /auth/',
            'Disallow: /account/',
            'Disallow: /cart',
            'Disallow: /wishlist',
            'Disallow: /checkout',
            'Disallow: /track',
            'Disallow: /search?',
            'Disallow: /api/',
            'Disallow: /admin/',
            '',
            '# Allow crawlers to access JS/CSS bundles needed for rendering',
            'Allow: /assets/',
            '',
            "Sitemap: {$sitemapUrl}",
        ]);

        return response($content, 200, [
            'Content-Type'  => 'text/plain; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /sitemap.xml
    // ─────────────────────────────────────────────────────────────────────────

    public function sitemap(): Response
    {
        $xml = Cache::remember('seo_sitemap_v1', 1800, function () {
            return $this->buildSitemap();
        });

        return response($xml, 200, [
            'Content-Type'  => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=1800',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Sitemap Builder
    // ─────────────────────────────────────────────────────────────────────────

    private function buildSitemap(): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://enterprise-pos-api.onrender.com'), '/');

        $urls = [];

        // ── Static public pages ───────────────────────────────────────────────
        $staticPages = [
            ['loc' => '/',         'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => '/products', 'priority' => '0.9', 'changefreq' => 'hourly'],
            ['loc' => '/blog',     'priority' => '0.7', 'changefreq' => 'daily'],
            ['loc' => '/about',    'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/contact',  'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/faq',      'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/terms',    'priority' => '0.3', 'changefreq' => 'monthly'],
            ['loc' => '/privacy',  'priority' => '0.3', 'changefreq' => 'monthly'],
            ['loc' => '/shipping', 'priority' => '0.4', 'changefreq' => 'monthly'],
            ['loc' => '/returns',  'priority' => '0.4', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $urls[] = $this->urlEntry(
                $frontendUrl . $page['loc'],
                now()->toAtomString(),
                $page['changefreq'],
                $page['priority']
            );
        }

        // ── Categories ────────────────────────────────────────────────────────
        try {
            Category::where('is_active', true)
                ->whereNull('deleted_at')
                ->select(['slug', 'updated_at'])
                ->orderBy('sort_order')
                ->limit(500)
                ->chunk(100, function ($categories) use ($frontendUrl, &$urls) {
                    foreach ($categories as $cat) {
                        $urls[] = $this->urlEntry(
                            "{$frontendUrl}/category/{$cat->slug}",
                            $cat->updated_at?->toAtomString() ?? now()->toAtomString(),
                            'weekly',
                            '0.8'
                        );
                    }
                });
        } catch (\Throwable) {
            // Silently skip if table is unavailable
        }

        // ── Brands ────────────────────────────────────────────────────────────
        try {
            Brand::where('is_active', true)
                ->whereNull('deleted_at')
                ->select(['slug', 'updated_at'])
                ->limit(200)
                ->chunk(100, function ($brands) use ($frontendUrl, &$urls) {
                    foreach ($brands as $brand) {
                        $urls[] = $this->urlEntry(
                            "{$frontendUrl}/brand/{$brand->slug}",
                            $brand->updated_at?->toAtomString() ?? now()->toAtomString(),
                            'weekly',
                            '0.7'
                        );
                    }
                });
        } catch (\Throwable) {}

        // ── Active Products ───────────────────────────────────────────────────
        try {
            Product::where('status', 'active')
                ->whereNull('deleted_at')
                ->select(['slug', 'updated_at'])
                ->orderByDesc('updated_at')
                ->limit(50000)
                ->chunk(200, function ($products) use ($frontendUrl, &$urls) {
                    foreach ($products as $product) {
                        $urls[] = $this->urlEntry(
                            "{$frontendUrl}/products/{$product->slug}",
                            $product->updated_at?->toAtomString() ?? now()->toAtomString(),
                            'weekly',
                            '0.7'
                        );
                    }
                });
        } catch (\Throwable) {}

        // ── Published Blog Posts ──────────────────────────────────────────────
        try {
            Blog::where('status', 'published')
                ->whereNull('deleted_at')
                ->whereNotNull('published_at')
                ->select(['slug', 'updated_at', 'published_at'])
                ->orderByDesc('published_at')
                ->limit(1000)
                ->chunk(100, function ($posts) use ($frontendUrl, &$urls) {
                    foreach ($posts as $post) {
                        $urls[] = $this->urlEntry(
                            "{$frontendUrl}/blog/{$post->slug}",
                            $post->updated_at?->toAtomString() ?? now()->toAtomString(),
                            'monthly',
                            '0.6'
                        );
                    }
                });
        } catch (\Throwable) {}

        return $this->wrapSitemap($urls);
    }

    private function urlEntry(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        $loc = htmlspecialchars($loc, ENT_XML1);
        return "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n    <changefreq>{$changefreq}</changefreq>\n    <priority>{$priority}</priority>\n  </url>";
    }

    private function wrapSitemap(array $urls): string
    {
        $body = implode("\n", $urls);
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
{$body}
</urlset>
XML;
    }
}
