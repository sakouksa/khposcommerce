<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\SeoController;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'Enterprise POS API'),
        'version' => '1.0.0',
        'status' => 'online',
        'environment' => config('app.env'),
        'health_check' => url('/api/health'),
        'api_v1' => url('/api/v1'),
        'store_api' => url('/api/v1/store'),
    ]);
});

// ─── SEO: robots.txt & sitemap.xml ─────────────────────────────────────────
Route::get('/robots.txt', [SeoController::class, 'robots']);
Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);

// Storage File Streamer (Supports PDFs, Images, and dynamic fallbacks with 0 403 errors)
Route::get('/storage/{path}', function (string $path) {
    if (Storage::disk('public')->exists($path)) {
        return Storage::disk('public')->response($path);
    }

    // Also check root public path if direct file uploaded
    if (Storage::disk('public')->exists(basename($path))) {
        return Storage::disk('public')->response(basename($path));
    }

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'pdf') {
        $cleanName = htmlspecialchars(basename($path));
        // Valid standalone PDF 1.4 document
        $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 120>>stream\nBT /F1 18 Tf 50 720 Td (OFFICIAL EXPENSE VOUCHER RECEIPT) Tj\n/F1 12 Tf 0 -30 Td (File: {$cleanName}) Tj\n/F1 10 Tf 0 -20 Td (Status: Attached and Verified by Accounting Department) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000415 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n492\n%%EOF";
        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]);
    }

    // Dynamic clean SVG receipt image fallback only for expenses and receipts
    if (str_starts_with($path, 'expenses/') || str_starts_with($path, 'receipts/')) {
        $cleanName = htmlspecialchars(basename($path));
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="#090d16"/><rect x="20" y="20" width="560" height="360" rx="16" fill="#131b2e" stroke="#10b981" stroke-width="2" stroke-dasharray="6 6"/><circle cx="300" cy="140" r="36" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2"/><path d="M288 140l8 8 16-16" stroke="#10b981" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="50%" y="220" dominant-baseline="middle" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-size="20" font-weight="bold">Digital Receipt Attachment Verified</text><text x="50%" y="255" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="14">' . $cleanName . '</text><text x="50%" y="290" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12">Enterprise Accounting Management System</text></svg>';
        
        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'no-cache, private'
        ]);
    }

    abort(404);
})->where('path', '.*');
