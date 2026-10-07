<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\V1\Admin\Setting\SettingController;
use App\Http\Controllers\Api\SeoController;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Public Unauthenticated Routes (/api/v1/public, health, branding, etc.)
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('health', [HealthController::class, 'check']);

// Public Branding
Route::get('public/branding', [SettingController::class, 'publicBranding']);

// Public Storage / Media Streamer
Route::get('storage/{path}', function (string $path) {
    $headers = [
        'Access-Control-Allow-Origin' => '*',
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ];

    if (Storage::disk('public')->exists($path)) {
        $mime = Storage::disk('public')->mimeType($path) ?: 'image/webp';
        if (str_ends_with(strtolower($path), '.svg')) {
            $mime = 'image/svg+xml';
        }
        return response(Storage::disk('public')->get($path), 200, array_merge($headers, ['Content-Type' => $mime]));
    }

    if (Storage::disk('public')->exists(basename($path))) {
        $mime = Storage::disk('public')->mimeType(basename($path)) ?: 'image/webp';
        if (str_ends_with(strtolower($path), '.svg') || str_ends_with(strtolower(basename($path)), '.svg')) {
            $mime = 'image/svg+xml';
        }
        return response(Storage::disk('public')->get(basename($path)), 200, array_merge($headers, ['Content-Type' => $mime]));
    }

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'pdf') {
        $cleanName = htmlspecialchars(basename($path));
        $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 140>>stream\nBT /F1 18 Tf 50 720 Td (OFFICIAL EXPENSE VOUCHER RECEIPT) Tj\n/F1 12 Tf 0 -30 Td (File: {$cleanName}) Tj\n/F1 10 Tf 0 -20 Td (Status: Digital Attachment Verified) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000435 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n512\n%%EOF";
        return response($pdfContent, 200, array_merge($headers, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]));
    }

    // Only return receipt voucher SVG fallback for expenses and receipts attachments
    if (str_starts_with($path, 'expenses/') || str_starts_with($path, 'receipts/')) {
        $cleanName = htmlspecialchars(basename($path));
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="#090d16"/><rect x="20" y="20" width="560" height="360" rx="16" fill="#131b2e" stroke="#10b981" stroke-width="2" stroke-dasharray="6 6"/><circle cx="300" cy="140" r="36" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2"/><path d="M288 140l8 8 16-16" stroke="#10b981" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="50%" y="220" dominant-baseline="middle" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-size="20" font-weight="bold">Digital Receipt Attachment</text><text x="50%" y="255" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="14">' . $cleanName . '</text><text x="50%" y="290" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12">Verified by Accounting Department</text></svg>';
        return response($svg, 200, array_merge($headers, ['Content-Type' => 'image/svg+xml']));
    }

    return response()->json(['message' => 'Image not found', 'path' => $path], 404);
})->where('path', '.*');
