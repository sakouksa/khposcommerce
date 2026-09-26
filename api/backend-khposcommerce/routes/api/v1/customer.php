<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\Customer\HomeController;
use App\Http\Controllers\Api\V1\Customer\CatalogController;
use App\Http\Controllers\Api\V1\Customer\SearchController;
use App\Http\Controllers\Api\V1\Customer\ContentController;
use App\Http\Controllers\Api\V1\Customer\CustomerAuthController;
use App\Http\Controllers\Api\V1\Customer\CartController;
use App\Http\Controllers\Api\V1\Customer\WishlistController;
use App\Http\Controllers\Api\V1\Customer\CustomerOrderController as OrderController;
use App\Http\Controllers\Api\V1\Customer\CustomerOrderReturnController;
use App\Http\Controllers\Api\V1\Customer\ReviewController;
use App\Http\Controllers\Api\V1\Customer\ChatbotController;

/*
|--------------------------------------------------------------------------
| Customer Storefront & E-Commerce Routes (/api/v1/customer & /api/v1/store)
|--------------------------------------------------------------------------
*/

// ── Homepage & Discovery ────────────────────────────────────────────────
Route::get('homepage',             [HomeController::class, 'homepage']);
Route::get('featured',             [HomeController::class, 'featured']);
Route::get('banners',              [HomeController::class, 'banners']);
Route::get('settings',             [HomeController::class, 'settings']);
Route::get('payment-methods',      [HomeController::class, 'paymentMethods']);
Route::get('shipping-methods',     [HomeController::class, 'shippingMethods']);
Route::get('provinces',            [HomeController::class, 'provinces']);

// ── Products & Catalog ──────────────────────────────────────────────────
Route::get('products',             [CatalogController::class, 'products']);
Route::get('products/{slug}',      [CatalogController::class, 'productDetail']);

// ── Categories & Brands ─────────────────────────────────────────────────
Route::get('categories',           [CatalogController::class, 'categories']);
Route::get('brands',               [CatalogController::class, 'brands']);

// ── Flash Sales ─────────────────────────────────────────────────────────
Route::get('flash-sales',          [CatalogController::class, 'flashSale']);
Route::get('flash-sale',           [CatalogController::class, 'flashSale']);

// ── Search & Autocomplete ───────────────────────────────────────────────
Route::get('search',               [SearchController::class, 'search']);
Route::get('search/autocomplete',  [SearchController::class, 'autocomplete']);
Route::get('trending-searches',    [SearchController::class, 'trendingSearches']);

// ── Coupons & Marketing ─────────────────────────────────────────────────
Route::post('coupons/validate',    [CatalogController::class, 'validateCoupon']);
Route::post('newsletter/subscribe', [ContentController::class, 'newsletterSubscribe']);

// ── Blog & Content ──────────────────────────────────────────────────────
Route::get('blog',                 [ContentController::class, 'blog']);
Route::get('blog/{slug}',          [ContentController::class, 'blogDetail']);
Route::get('pages/{slug}',         [ContentController::class, 'pageDetail']);
Route::get('faqs',                 [ContentController::class, 'faqs']);

// ── Customer Authentication ─────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register',        [CustomerAuthController::class, 'register']);
    Route::post('login',           [CustomerAuthController::class, 'login']);
    Route::post('google',          [CustomerAuthController::class, 'googleLogin']);
    Route::post('forgot-password', [CustomerAuthController::class, 'forgotPassword']);
    Route::post('reset-password',  [CustomerAuthController::class, 'resetPassword']);

    Route::middleware('auth.jwt')->group(function () {
        Route::get('me',               [CustomerAuthController::class, 'me']);
        Route::put('profile',          [CustomerAuthController::class, 'updateProfile']);
        Route::post('change-password', [CustomerAuthController::class, 'changePassword']);
        Route::post('logout',          [CustomerAuthController::class, 'logout']);
    });
});

// ── Shopping Cart ───────────────────────────────────────────────────────
Route::get('cart',                 [CartController::class, 'show']);
Route::post('cart/add',            [CartController::class, 'add']);
Route::put('cart/update',          [CartController::class, 'update']);
Route::delete('cart/remove',       [CartController::class, 'remove']);
Route::delete('cart/clear',        [CartController::class, 'clear']);
Route::post('cart/apply-coupon',   [CartController::class, 'applyCoupon']);

// ── Protected Customer Actions (Checkout, Wishlist, Orders, Reviews) ─────
Route::middleware('auth.jwt')->group(function () {
    Route::post('cart/checkout',   [CartController::class, 'checkout']);

    // Wishlist
    Route::get('wishlist',                      [WishlistController::class, 'index']);
    Route::post('wishlist/add',                 [WishlistController::class, 'add']);
    Route::post('wishlist/move-all-to-cart',    [WishlistController::class, 'moveAllToCart']);
    Route::delete('wishlist/{id}',              [WishlistController::class, 'remove']);
    Route::delete('wishlist/product/{productId}', [WishlistController::class, 'removeByProduct']);
    Route::post('wishlist/{id}/move-to-cart',   [WishlistController::class, 'moveToCart']);
    Route::get('wishlist/check/{productId}',    [WishlistController::class, 'check']);

    // Orders
    Route::get('orders',            [OrderController::class, 'myOrders']);
    Route::get('orders/{number}',   [OrderController::class, 'trackByNumber']);

    // Returns & Exchanges (RMA)
    Route::get('returns',                         [CustomerOrderReturnController::class, 'myReturns']);
    Route::get('returns/{returnNumber}',          [CustomerOrderReturnController::class, 'returnDetails']);
    Route::get('orders/{orderId}/items/{itemId}/return-eligibility', [CustomerOrderReturnController::class, 'checkEligibility']);
    Route::post('returns',                        [CustomerOrderReturnController::class, 'requestReturn']);

    // Reviews
    Route::post('reviews',          [ReviewController::class, 'store']);
});

// ── Public Order Tracking ───────────────────────────────────────────────
Route::get('track/{number}',       [OrderController::class, 'trackByNumber']);

// ── AI Chatbot & Shopping Assistant ─────────────────────────────────────
Route::prefix('chat')->group(function () {
    Route::post('message',         [ChatbotController::class, 'sendMessage']);
    Route::get('history',          [ChatbotController::class, 'getHistory']);
    Route::delete('history',       [ChatbotController::class, 'clearHistory']);
    Route::post('support',         [ChatbotController::class, 'createSupportRequest']);
});

// ── Telegram Account Linking ────────────────────────────────────────────
Route::prefix('telegram')->group(function () {
    Route::middleware('auth.jwt')->group(function () {
        Route::post('link-code',   [ChatbotController::class, 'generateTelegramLinkCode']);
        Route::get('status',       [ChatbotController::class, 'getTelegramStatus']);
        Route::delete('unlink',    [ChatbotController::class, 'unlinkTelegram']);
    });
});
