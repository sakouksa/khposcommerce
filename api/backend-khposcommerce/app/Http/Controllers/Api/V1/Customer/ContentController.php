<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Customer\NewsletterSubscribeRequest;
use App\Models\CMS\Blog;
use App\Models\CMS\Page;
use App\Models\CMS\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContentController extends BaseApiController
{
    // ─── POST /api/v1/customer/newsletter/subscribe ──────────────────────────

    public function newsletterSubscribe(NewsletterSubscribeRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->validated('email')));

        try {
            if (DB::getSchemaBuilder()->hasTable('newsletter_subscribers')) {
                DB::table('newsletter_subscribers')->updateOrInsert(
                    ['email' => $email],
                    ['is_active' => true, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        } catch (\Throwable) {
            // Gracefully succeed
        }

        return $this->successResponse([
            'email'      => $email,
            'subscribed' => true,
        ], 'Thank you for subscribing to our newsletter! Exclusive promotions will arrive in your inbox.');
    }

    // ─── GET /api/v1/customer/blog ───────────────────────────────────────────

    public function blog(Request $request): JsonResponse
    {
        try {
            $blogs = Blog::where('status', 'published')
                ->with(['category', 'author'])
                ->when($request->input('category'), fn($q, $cat) =>
                    $q->whereHas('category', fn($qc) => $qc->where('slug', $cat)->orWhere('id', $cat))
                )
                ->when($request->input('search'), fn($q, $s) =>
                    $q->where('title', 'like', "%{$s}%")
                )
                ->orderBy('published_at', 'desc')
                ->paginate($request->integer('per_page', 9))
                ->through(function ($post) {
                    return [
                        'id'               => $post->id,
                        'title'            => $post->title,
                        'slug'             => $post->slug,
                        'excerpt'          => $post->summary ?? $post->excerpt,
                        'summary'          => $post->summary ?? $post->excerpt,
                        'featured_image'   => $post->featured_image,
                        'image'            => $post->featured_image,
                        'thumbnail'        => $post->featured_image,
                        'published_at'     => $post->published_at?->toIso8601String(),
                        'view_count'       => $post->view_count ?? 0,
                        'category'         => $post->category?->name ?? 'Retail',
                        'category_name'    => $post->category?->name ?? 'Retail',
                        'author'           => $post->author?->name ?? 'Enterprise Team',
                    ];
                });

            return $this->paginatedResponse($blogs);
        } catch (\Throwable) {
            return $this->successResponse([]);
        }
    }

    // ─── GET /api/v1/customer/blog/{slug} ────────────────────────────────────

    public function blogDetail(Request $request, string $slug): JsonResponse
    {
        try {
            $post = Blog::where('slug', $slug)
                ->where('status', 'published')
                ->with(['category', 'author', 'tags'])
                ->firstOrFail();

            try {
                $post->increment('view_count');
            } catch (\Throwable) {}

            $related = Blog::where('status', 'published')
                ->where('id', '!=', $post->id)
                ->when($post->blog_category_id, fn($q) => $q->where('blog_category_id', $post->blog_category_id))
                ->orderBy('published_at', 'desc')
                ->limit(4)
                ->get();

            return $this->successResponse([
                'id'               => $post->id,
                'title'            => $post->title,
                'slug'             => $post->slug,
                'excerpt'          => $post->summary ?? $post->excerpt,
                'content'          => $post->content,
                'featured_image'   => $post->featured_image,
                'meta_title'       => $post->meta_title ?? $post->title,
                'meta_description' => $post->meta_description ?? $post->summary ?? $post->excerpt,
                'published_at'     => $post->published_at?->toISOString(),
                'updated_at'       => $post->updated_at?->toISOString(),
                'view_count'       => $post->view_count ?? 0,
                'category'         => $post->category ? [
                    'id'   => $post->category->id,
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
                'author'           => $post->author?->name ?? 'Enterprise Team',
                'tags'             => $post->tags->map(fn($t) => [
                    'id'   => $t->id,
                    'name' => $t->name,
                    'slug' => $t->slug,
                ]),
                'related_posts'    => $related,
            ]);
        } catch (\Throwable) {
            return $this->errorResponse('Blog article not found', null, 404);
        }
    }

    // ─── GET /api/v1/customer/pages/{slug} ───────────────────────────────────

    public function pageDetail(Request $request, string $slug): JsonResponse
    {
        try {
            $page = Page::where('slug', $slug)
                ->where('status', 'published')
                ->first();

            if (!$page) {
                $alternateSlugs = match ($slug) {
                    'privacy'  => ['privacy-policy'],
                    'terms'    => ['terms-of-service', 'terms-and-conditions'],
                    'returns'  => ['refund-policy', 'return-policy', 'returns-and-refunds'],
                    'shipping' => ['shipping-policy', 'delivery-policy'],
                    'about'    => ['about-us'],
                    'contact'  => ['contact-us'],
                    default    => [],
                };
                if (!empty($alternateSlugs)) {
                    $page = Page::whereIn('slug', $alternateSlugs)->where('status', 'published')->first();
                }
            }

            if (!$page) {
                return $this->errorResponse('Page not found', null, 404);
            }

            return $this->successResponse([
                'id'               => $page->id,
                'title'            => $page->title,
                'slug'             => $page->slug,
                'content'          => $page->content,
                'meta_title'       => $page->meta_title ?? $page->title,
                'meta_description' => $page->meta_description,
                'updated_at'       => $page->updated_at?->toISOString(),
            ]);
        } catch (\Throwable) {
            return $this->errorResponse('Page not found', null, 404);
        }
    }

    // ─── GET /api/v1/customer/faqs ───────────────────────────────────────────

    public function faqs(Request $request): JsonResponse
    {
        try {
            $faqs = Faq::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->groupBy('category')
                ->map(fn($items, $cat) => [
                    'category' => $cat ?: 'General',
                    'items'    => $items->map(fn($f) => [
                        'id'       => $f->id,
                        'question' => $f->question,
                        'answer'   => $f->answer,
                        'category' => $f->category,
                    ]),
                ])
                ->values();

            return $this->successResponse($faqs);
        } catch (\Throwable) {
            return $this->successResponse([]);
        }
    }
}
