<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CMS\CreateBlogRequest;
use App\Http\Requests\CMS\UpdateBlogRequest;
use App\Http\Resources\CMS\BlogResource;
use App\Services\CMS\BlogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends BaseApiController
{
    public function __construct(private readonly BlogService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->only(['search', 'status']),
            ['category', 'author', 'tags']
        );
        
        $resourceCollection = BlogResource::collection($records);
        
        return response()->json([
            'success'    => true,
            'message'    => 'Success',
            'data'       => $resourceCollection->resolve(),
            'pagination' => [
                'total'        => $records->total(),
                'per_page'     => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
                'from'         => $records->firstItem(),
                'to'           => $records->lastItem(),
            ],
        ]);
    }

    public function store(CreateBlogRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new BlogResource($record),
            'Blog created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['category', 'author', 'tags']);
        return $this->successResponse(
            new BlogResource($record),
            'Blog details retrieved successfully'
        );
    }

    public function update(UpdateBlogRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new BlogResource($record),
            'Blog updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);
            return $this->successResponse(null, 'Blog deleted successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return $this->errorResponse('No IDs provided', 422);
        }

        try {
            $count = $this->service->bulkDelete($ids);
            return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} blogs");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restore($id);
            return $this->successResponse(null, 'Blog restored successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function forceDelete(int $id): JsonResponse
    {
        try {
            $this->service->forceDelete($id);
            return $this->successResponse(null, 'Blog permanently deleted successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function stats(): JsonResponse
    {
        $totalBlogs = \App\Models\CMS\Blog::count();
        $publishedBlogs = \App\Models\CMS\Blog::where('status', 'published')->count();
        $draftBlogs = \App\Models\CMS\Blog::where('status', 'draft')->count();
        $archivedBlogs = \App\Models\CMS\Blog::where('status', 'archived')->count();
        $todayBlogs = \App\Models\CMS\Blog::whereDate('created_at', today())->count();
        $totalViews = (int) \App\Models\CMS\Blog::sum('view_count');
        $blogsWithImage = \App\Models\CMS\Blog::whereNotNull('featured_image')->where('featured_image', '!=', '')->count();

        $totalCategories = \App\Models\CMS\BlogCategory::count();
        $activeCategories = \App\Models\CMS\BlogCategory::where('is_active', 1)->count();
        $inactiveCategories = $totalCategories - $activeCategories;
        $categoriesWithDesc = \App\Models\CMS\BlogCategory::whereNotNull('description')->where('description', '!=', '')->count();

        $totalTags = \App\Models\CMS\BlogTag::count();

        $totalPages = \App\Models\CMS\Page::count();
        $publishedPages = \App\Models\CMS\Page::where('status', 'published')->count();
        $draftPages = \App\Models\CMS\Page::where('status', '!=', 'published')->count();
        $pagesWithSeo = \App\Models\CMS\Page::where(function($q) {
            $q->whereNotNull('meta_title')->where('meta_title', '!=', '')
              ->orWhere(function($q2) {
                  $q2->whereNotNull('meta_description')->where('meta_description', '!=', '');
              });
        })->count();

        $totalFaqs = \App\Models\CMS\Faq::count();
        $activeFaqs = \App\Models\CMS\Faq::where('is_active', 1)->count();
        $inactiveFaqs = $totalFaqs - $activeFaqs;
        $faqCategoriesCount = \App\Models\CMS\Faq::distinct('category')->whereNotNull('category')->where('category', '!=', '')->count('category');

        return $this->successResponse([
            'blogs' => [
                'total' => $totalBlogs,
                'published' => $publishedBlogs,
                'draft' => $draftBlogs,
                'archived' => $archivedBlogs,
                'today' => $todayBlogs,
                'total_views' => $totalViews,
                'with_images' => $blogsWithImage,
            ],
            'categories' => [
                'total' => $totalCategories,
                'active' => $activeCategories,
                'inactive' => $inactiveCategories,
                'with_description' => $categoriesWithDesc,
            ],
            'tags' => [
                'total' => $totalTags,
            ],
            'pages' => [
                'total' => $totalPages,
                'published' => $publishedPages,
                'draft' => $draftPages,
                'with_seo' => $pagesWithSeo,
            ],
            'faqs' => [
                'total' => $totalFaqs,
                'active' => $activeFaqs,
                'inactive' => $inactiveFaqs,
                'categories_count' => $faqCategoriesCount,
            ],
        ], 'CMS stats retrieved successfully');
    }

    /**
     * POST /api/v1/telegram/broadcast
     * Broadcast new blog article to public Telegram Channel (e.g. @nextech_cambodia)
     */
    public function broadcastToTelegram(Request $request, \App\Services\Telegram\TelegramService $telegramService): JsonResponse
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'message'    => 'nullable|string',
            'category'   => 'nullable|string|max:100',
            'read_time'  => 'nullable|string|max:50',
            'link'       => 'nullable|string',
            'image_url'  => 'nullable|string',
            'channel_id' => 'nullable|string',
            'locale'     => 'nullable|string|in:km,en',
        ]);

        $rawLocale = $validated['locale'] ?? ($request->header('X-Locale') === 'km' ? 'km' : 'en');
        $locale = $rawLocale === 'km' ? 'km' : 'en';

        $channel = $validated['channel_id']
            ?? config('services.telegram.channel_id')
            ?? env('TELEGRAM_CHANNEL_ID', '@nextech_cambodia');

        $channelUrl = config('services.telegram.channel_url') ?: 'https://t.me/nextech_cambodia';

        $title = strip_tags($validated['title']);
        $excerpt = strip_tags($validated['message'] ?? '');
        $rawCategory = strip_tags($validated['category'] ?? '');

        // Extract clean category key if wrapped in parentheses
        $cleanCatKey = $rawCategory;
        if (preg_match('/\(([^)]+)\)/', $rawCategory, $matches)) {
            $cleanCatKey = trim($matches[1]);
        }

        // Translation helper using backend lang/{locale}/telegram.php
        $t = function (string $key, array $replace = []) use ($locale) {
            return __("telegram.{$key}", $replace, $locale);
        };

        // Translate category from lang/{locale}/telegram.php categories array
        $category = __("telegram.categories.{$cleanCatKey}", [], $locale);
        if ($category === "telegram.categories.{$cleanCatKey}") {
            $category = $rawCategory ?: $t('categories.Tech & Business');
        }

        // Parse read time
        $rawReadTime = strip_tags($validated['read_time'] ?? '');
        preg_match('/(\d+)/', $rawReadTime, $numMatches);
        $minutes = $numMatches[1] ?? '2';
        $readTime = $t('read_time', ['min' => $minutes]);

        $rawLink = $validated['link'] ?? '';
        $imageUrl = $validated['image_url'] ?? null;
        $dateStr = now()->format('d M Y');

        // Telegram Bot API strictly rejects 'localhost' and '127.0.0.1' in inline keyboard URLs
        $publicBase = env('PUBLIC_STOREFRONT_URL', 'https://storefrontkhposcommerce.vercel.app');
        $storefrontBlogUrl = rtrim($publicBase, '/') . '/blog';

        if (!empty($rawLink) && preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?(/.*)?$#i', $rawLink, $matches)) {
            $path = $matches[3] ?? '';
            $link = rtrim($publicBase, '/') . $path;
        } elseif (!empty($rawLink) && filter_var($rawLink, FILTER_VALIDATE_URL)) {
            $link = $rawLink;
        } else {
            $link = $storefrontBlogUrl;
        }

        // Truncate excerpt if too long so total caption is safely under 950 chars (Telegram max 1024)
        if (mb_strlen($excerpt) > 220) {
            $excerpt = mb_substr($excerpt, 0, 215) . '...';
        }

        // Build elegant, magazine-style Telegram HTML broadcast using translation dictionary
        $text = "🔥 <b>" . $t('featured_post') . "</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📰 <b>{$title}</b>\n\n";

        $text .= "🏷️ <b>" . $t('category_label') . ":</b> {$category}\n";
        $text .= "⏱️ <b>" . $t('read_time', ['min' => $minutes]) . "</b> • 📅 <b>" . $t('published_date') . ":</b> {$dateStr}\n\n";

        if (!empty($excerpt)) {
            $text .= "📝 <b>" . $t('executive_brief') . ":</b>\n";
            $text .= "<blockquote>{$excerpt}</blockquote>\n\n";
        }

        $text .= "✨ <b>" . $t('key_highlights') . ":</b>\n";
        $text .= "• ⚡ <b>" . $t('highlight_automation') . "</b>\n";
        $text .= "• 💳 <b>" . $t('highlight_payments') . "</b>\n";
        $text .= "• 📈 <b>" . $t('highlight_efficiency') . "</b>\n\n";

        $text .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "🚀 <b>" . $t('brand_signature') . "</b>\n";
        $text .= "📢 <b>" . $t('official_channel') . ":</b> {$channel}\n";
        $text .= "🏷️ <code>#NexTech #POSCommerce #RetailTech #CloudPOS #KHQR</code>";

        $buttons = [
            [
                ['text' => $t('read_article'), 'url' => $link],
                ['text' => $t('official_website'), 'url' => $storefrontBlogUrl],
            ],
            [
                ['text' => $t('join_channel'), 'url' => $channelUrl],
            ]
        ];

        $replyMarkup = [
            'inline_keyboard' => $buttons
        ];

        // If local relative image, prepend app url
        if ($imageUrl && !str_starts_with($imageUrl, 'http://') && !str_starts_with($imageUrl, 'https://')) {
            $imageUrl = url($imageUrl);
        }

        if ($imageUrl) {
            $result = $telegramService->sendPhoto($channel, $imageUrl, $text, $replyMarkup);
        } else {
            $result = $telegramService->sendMessage($channel, $text, $replyMarkup);
        }

        if (!($result['ok'] ?? false)) {
            $errorDesc = $result['description'] ?? 'Failed to send message to Telegram channel.';
            if (str_contains($errorDesc, 'bot is not a member') || str_contains($errorDesc, 'chat not found') || str_contains($errorDesc, 'Forbidden')) {
                $botName = config('services.telegram.bot_username') ?: 'nextech_cambodia_bot';
                $errorDesc = $t('bot_not_admin', ['bot' => $botName, 'channel' => $channel]);
            }
            return response()->json([
                'success' => false,
                'message' => $errorDesc,
                'data'    => [
                    'channel'     => $channel,
                    'channel_url' => $channelUrl,
                    'result'      => $result,
                ]
            ], 422);
        }

        $isConfigured = $telegramService->isConfigured();

        return $this->successResponse([
            'channel'        => $channel,
            'channel_url'    => $channelUrl,
            'title'          => $title,
            'result'         => $result,
            'is_configured'  => $isConfigured,
            'broadcasted_at' => now()->toIso8601String(),
        ], $t('broadcast_success'));
    }
}
