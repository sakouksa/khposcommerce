<?php

namespace App\Http\Controllers\Api\V1\Admin\Setting;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Traits\FormatsMediaUrl;
use App\Models\Setting\Setting;
use App\Models\Company\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends BaseApiController
{
    use FormatsMediaUrl;

    /**
     * GET /api/v1/settings
     */
    public function index(Request $request): JsonResponse
    {
        $settings = Setting::all();
        return $this->successResponse($settings);
    }

    /**
     * POST /api/v1/settings
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'settings'   => 'required|array',
        ]);

        foreach ($data['settings'] as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value'      => is_array($value) ? json_encode($value) : (string) $value,
                    'company_id' => $data['company_id'],
                ]
            );
        }

        return $this->successResponse(null, 'Settings updated successfully.');
    }

    /**
     * GET /api/v1/settings/{key}
     */
    public function show(string $key): JsonResponse
    {
        $setting = Setting::where('key', $key)->first();
        if (!$setting && $key === 'announcement_bar') {
            $default = [
                'enabled'     => true,
                'message'     => '🚚 Free Nationwide Delivery across Cambodia on all orders over $50!',
                'message_km'  => '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ!',
                'link'        => '/promotions',
                'coupon_code' => 'OPTAPOS2026',
                'bg_gradient' => 'from-indigo-600 to-purple-700',
                'badge_text'  => 'SPECIAL PROMO',
            ];
            $company = \App\Models\Company\Company::first();
            $setting = Setting::create([
                'company_id' => $company?->id ?? 1,
                'key'        => 'announcement_bar',
                'value'      => json_encode($default),
                'type'       => 'json',
                'group'      => 'cms',
                'is_public'  => true,
            ]);
        }
        if (!$setting) {
            return $this->notFoundResponse('Setting not found.');
        }
        return $this->successResponse($setting);
    }

    /**
     * PUT /api/v1/settings/{key}
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $data = $request->validate([
            'value' => 'required',
        ]);

        $company = \App\Models\Company\Company::first();
        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'value'      => is_array($data['value']) ? json_encode($data['value']) : (string) $data['value'],
                'company_id' => $company?->id ?? 1,
                'type'       => is_array($data['value']) || (is_string($data['value']) && str_starts_with($data['value'], '{')) ? 'json' : 'string',
                'group'      => $key === 'announcement_bar' ? 'cms' : 'general',
                'is_public'  => true,
            ]
        );

        $this->clearStorefrontCache();

        return $this->successResponse($setting, 'Setting updated successfully.');
    }

    /**
     * Helper to clear storefront cache
     */
    protected function clearStorefrontCache(): void
    {
        \App\Services\Support\StorefrontCacheService::clearStorefront();
    }

    /**
     * GET /api/v1/public/branding
     */
    public function publicBranding(): JsonResponse
    {
        $company = \App\Models\Company\Company::where('is_active', true)->orderBy('id')->first();
        $siteName = Setting::where('key', 'site_name')->value('value') ?: ($company?->name ?: 'OptaPOS');
        $companyName = Setting::where('key', 'company_name')->value('value') ?: ($company?->name ?: $siteName);
        $siteEmail = Setting::where('key', 'site_email')->value('value') ?: ($company?->email ?: 'support@optapos.io');
        $sitePhone = Setting::where('key', 'company_phone')->value('value') ?: ($company?->phone ?: '+855 23 888 999');
        $siteTagline = Setting::where('key', 'site_tagline')->value('value') ?: 'Next-Generation Enterprise POS & Omni-Channel Commerce';
        $siteTaglineKm = Setting::where('key', 'site_tagline_km')->value('value') ?: 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និងពាណិជ្ជកម្មឆ្លាតវៃជំនាន់ក្រោយ';
        
        $siteLogo = Setting::where('key', 'site_logo')->value('value');
        $rawLogo = $siteLogo ?: ($company?->logo ?: '/logo.png');
        $formattedLogo = $this->formatMediaUrl($rawLogo) ?: '/logo.png';

        return $this->successResponse([
            'brand_name'       => $siteName,
            'brand_tagline'    => $siteTagline,
            'brand_tagline_km' => $siteTaglineKm,
            'company_name'     => $companyName,
            'logo'             => $formattedLogo,
            'email'            => $siteEmail,
            'phone'            => $sitePhone,
            'address'          => $company?->address ?: 'Phnom Penh, Cambodia',
            'currency'         => $company?->currency_code ?: 'USD',
            'timezone'         => $company?->timezone ?: 'Asia/Phnom_Penh',
        ], 'Public branding retrieved successfully.');
    }

    /**
     * Delete previous custom logo file from public storage if it exists and is not a protected asset
     */
    protected function deleteOldLogoFile(?string $oldPath): void
    {
        if (empty($oldPath)) {
            return;
        }

        app(\App\Services\Support\FileService::class)->delete($oldPath);
    }

    /**
     * POST /api/v1/settings/logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo'        => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'company_id'  => 'nullable|integer',
        ]);

        $companyId = $request->input('company_id', 1);
        $company = Company::find($companyId) ?: Company::first();

        // 1. Identify previous old custom logo before storing new one
        $oldLogo = Setting::where('key', 'site_logo')->value('value')
            ?: ($company?->logo ?: null);

        // 2. Store new logo file
        $file = $request->file('logo');
        $filename = 'logo_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $storedRel = $file->storeAs('companies', $filename, 'public');
        $path = 'storage/' . $storedRel;

        // 3. Delete previous old logo file from disk to prevent storage accumulation
        $this->deleteOldLogoFile($oldLogo);

        // 4. Update Database
        if ($company) {
            $company->update(['logo' => $path]);
        }
        // Also update all companies so multi-tenant default stays consistent
        Company::query()->update(['logo' => $path]);

        Setting::updateOrCreate(
            ['company_id' => $company?->id ?? 1, 'key' => 'site_logo'],
            ['value' => $path, 'type' => 'string', 'group' => 'general']
        );

        $this->clearStorefrontCache();

        return $this->successResponse([
            'logo_url'     => $path,
            'company_id'   => $company?->id,
            'company_name' => $company?->name,
        ], 'Logo uploaded and old file cleaned up successfully.');
    }

    /**
     * DELETE /api/v1/settings/logo
     */
    public function removeLogo(Request $request): JsonResponse
    {
        $companyId = $request->input('company_id', 1);
        $company = Company::find($companyId) ?: Company::first();

        // 1. Delete previous custom logo file from disk
        $oldLogo = Setting::where('key', 'site_logo')->value('value')
            ?: ($company?->logo ?: null);
        $this->deleteOldLogoFile($oldLogo);

        // 2. Reset back to official default logo
        $defaultLogo = 'storage/companies/nexpos-logo.jpg';
        if ($company) {
            $company->update(['logo' => $defaultLogo]);
        }
        Company::query()->update(['logo' => $defaultLogo]);

        Setting::updateOrCreate(
            ['company_id' => $company?->id ?? 1, 'key' => 'site_logo'],
            ['value' => $defaultLogo, 'type' => 'string', 'group' => 'general']
        );

        $this->clearStorefrontCache();

        return $this->successResponse([
            'logo_url'     => $defaultLogo,
            'company_id'   => $company?->id,
            'company_name' => $company?->name,
        ], 'Logo removed from disk and reset to default successfully.');
    }
}
