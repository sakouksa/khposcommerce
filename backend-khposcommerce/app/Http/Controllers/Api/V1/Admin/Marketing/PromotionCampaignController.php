<?php

namespace App\Http\Controllers\Api\V1\Admin\Marketing;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Marketing\PromotionCampaign;
use App\Models\Marketing\PromotionRule;
use App\Models\Marketing\PromotionCoupon;
use App\Models\Marketing\PromotionUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PromotionCampaignController extends BaseApiController
{
    /**
     * List promotion campaigns with filters and authorization check.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $accessibleBranchIds = $user?->accessibleBranchIds() ?? [];

        $query = PromotionCampaign::where('company_id', $companyId)
            ->with([
                'branches:id,name,code',
                'channels:id,promotion_campaign_id,channel',
                'customerGroups:id,name',
                'rules' => fn($q) => $q->orderBy('priority', 'desc'),
                'rules.products:id,name,sku,selling_price',
                'rules.categories:id,name',
                'rules.brands:id,name',
                'coupons',
            ])
            ->withCount(['usages', 'rules']);

        // Branch scope enforcement: user should only see campaigns applicable to their accessible branches or company-wide
        if (!empty($accessibleBranchIds) && !$user?->hasRole(['super_admin', 'owner'])) {
            $query->where(function ($q) use ($accessibleBranchIds) {
                $q->whereDoesntHave('branches')
                  ->orWhereHas('branches', fn($b) => $b->whereIn('branches.id', $accessibleBranchIds));
            });
        }

        // Search query
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Branch filter
        if ($branchId = $request->input('branch_id')) {
            if ($branchId !== 'all') {
                $query->forBranch((int) $branchId);
            }
        }

        // Channel filter
        if ($channel = $request->input('channel')) {
            if ($channel !== 'all') {
                $query->forChannel($channel);
            }
        }

        // Active state filter
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 15)));
        $paginator = $query->orderBy('priority', 'desc')->orderBy('id', 'desc')->paginate($perPage);

        return $this->successResponse($paginator, 'Promotion campaigns retrieved successfully');
    }

    /**
     * Show single promotion campaign with full relations.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $campaign = PromotionCampaign::where('company_id', $companyId)
            ->where('id', $id)
            ->with([
                'branches',
                'channels',
                'customerGroups',
                'customers',
                'rules.products',
                'rules.categories',
                'rules.brands',
                'rules.buyXGetY',
                'rules.bundles.items',
                'coupons',
                'creator:id,name',
                'updater:id,name',
            ])
            ->withCount(['usages', 'rules'])
            ->firstOrFail();

        // Calculate performance summary
        $totalDiscountGiven = (float) PromotionUsage::where('promotion_campaign_id', $campaign->id)->sum('discount_amount');
        $redemptionsCount   = (int) PromotionUsage::where('promotion_campaign_id', $campaign->id)->count();

        $campaignArray = $campaign->toArray();
        $campaignArray['performance'] = [
            'total_discount_given' => $totalDiscountGiven,
            'total_redemptions'    => $redemptionsCount,
            'remaining_usage'      => $campaign->usage_limit ? max(0, $campaign->usage_limit - $campaign->usage_count) : null,
        ];

        return $this->successResponse($campaignArray, 'Campaign details retrieved successfully');
    }

    /**
     * Store a new promotion campaign with its rules, scopes, and coupons.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $rawBranchIds = $request->input('branch_ids');
        if ($rawBranchIds === 'all' || (is_array($rawBranchIds) && in_array('all', $rawBranchIds, true))) {
            $request->merge(['branch_ids' => []]);
        } elseif (is_string($rawBranchIds) && is_numeric($rawBranchIds)) {
            $request->merge(['branch_ids' => [(int) $rawBranchIds]]);
        }

        $rawChannels = $request->input('channels') ?? $request->input('channel_scope');
        if (is_string($rawChannels)) {
            $request->merge(['channels' => [$rawChannels]]);
        }

        if (!$request->filled('code') && $request->filled('name')) {
            $slug = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', (string)$request->input('name')), 0, 8));
            $code = ($slug ?: 'PROMO') . '-' . strtoupper(substr(uniqid(), -4));
            $request->merge(['code' => $code]);
        }

        $validated = $request->validate([
            'name'                 => 'required|string|max:191',
            'code'                 => ['required', 'string', 'max:50', Rule::unique('promotion_campaigns', 'code')->where('company_id', $companyId)],
            'description'          => 'nullable|string|max:2000',
            'status'               => 'nullable|string|in:draft,scheduled,active,paused,expired,cancelled',
            'start_at'             => 'nullable|date',
            'end_at'               => 'nullable|date|after_or_equal:start_at',
            'priority'             => 'nullable|integer|min:0|max:1000',
            'is_stackable'         => 'nullable|boolean',
            'is_active'            => 'nullable|boolean',
            'usage_limit'          => 'nullable|integer|min:1',
            'branch_ids'           => 'nullable|array',
            'branch_ids.*'         => 'integer|exists:branches,id',
            'channels'             => 'nullable|array',
            'channels.*'           => 'string|in:pos,web,mobile,all',
            'customer_group_ids'   => 'nullable|array',
            'customer_group_ids.*' => 'integer|exists:customer_groups,id',
            'rules'                => 'nullable|array',
            'rules.*.name'         => 'required|string|max:191',
            'rules.*.rule_type'    => 'required|string|in:product_discount,category_discount,brand_discount,cart_discount,buy_x_get_y,bundle_discount,free_shipping,coupon_discount',
            'rules.*.discount_type'=> 'required|string|in:percentage,fixed_amount,fixed_price,free_item,free_shipping',
            'rules.*.discount_value'=> 'required|numeric|min:0',
            'rules.*.min_qty'      => 'nullable|numeric|min:0',
            'rules.*.max_qty'      => 'nullable|numeric|min:0',
            'rules.*.min_subtotal' => 'nullable|numeric|min:0',
            'rules.*.max_subtotal' => 'nullable|numeric|min:0',
            'rules.*.max_discount_amount' => 'nullable|numeric|min:0',
            'rules.*.priority'     => 'nullable|integer|min:0|max:1000',
            'rules.*.is_stackable' => 'nullable|boolean',
            'rules.*.is_active'    => 'nullable|boolean',
            'rules.*.product_ids'  => 'nullable|array',
            'rules.*.product_ids.*'=> 'integer|exists:products,id',
            'rules.*.category_ids' => 'nullable|array',
            'rules.*.category_ids.*'=> 'integer|exists:categories,id',
            'rules.*.brand_ids'    => 'nullable|array',
            'rules.*.brand_ids.*'  => 'integer|exists:brands,id',
            'coupons'              => 'nullable|array',
            'coupons.*.code'       => 'required|string|max:50|unique:promotion_coupons,code',
            'coupons.*.usage_limit'=> 'nullable|integer|min:1',
            'coupons.*.usage_per_customer' => 'nullable|integer|min:1',
            'coupons.*.starts_at'  => 'nullable|date',
            'coupons.*.expires_at' => 'nullable|date',
        ]);

        // Branch scope authorization check: cannot assign branches user cannot access
        if (!empty($validated['branch_ids']) && !$user?->hasRole(['super_admin', 'owner'])) {
            foreach ($validated['branch_ids'] as $bId) {
                if (!$user?->canAccessBranch($bId)) {
                    return $this->errorResponse("Unauthorized to assign campaign to branch ID: {$bId}", null, 403);
                }
            }
        }

        $campaign = DB::transaction(function () use ($validated, $companyId, $user, $request) {
            $campaign = PromotionCampaign::create([
                'company_id'   => $companyId,
                'name'         => $validated['name'],
                'code'         => strtoupper(trim($validated['code'])),
                'description'  => $validated['description'] ?? null,
                'status'       => $validated['status'] ?? 'active',
                'start_at'     => $validated['start_at'] ?? $request->input('starts_at') ?? null,
                'end_at'       => $validated['end_at'] ?? $request->input('ends_at') ?? null,
                'priority'     => (int) ($validated['priority'] ?? 10),
                'is_stackable' => $validated['is_stackable'] ?? true,
                'is_active'    => $validated['is_active'] ?? true,
                'usage_limit'  => $validated['usage_limit'] ?? $request->input('max_redemptions') ?? null,
                'created_by'   => $user?->id,
                'updated_by'   => $user?->id,
            ]);

            // Sync Branches
            if (isset($validated['branch_ids'])) {
                $campaign->branches()->sync($validated['branch_ids']);
            }

            // Sync Channels
            if (!empty($validated['channels'])) {
                foreach ($validated['channels'] as $ch) {
                    $campaign->channels()->create(['channel' => $ch]);
                }
            } else {
                $campaign->channels()->create(['channel' => 'all']);
            }

            // Sync Customer Groups
            if (isset($validated['customer_group_ids'])) {
                $campaign->customerGroups()->sync($validated['customer_group_ids']);
            }

            // Create Rules & Targets
            if (!empty($validated['rules'])) {
                foreach ($validated['rules'] as $ruleData) {
                    $rule = $campaign->rules()->create([
                        'name'                => $ruleData['name'],
                        'rule_type'           => $ruleData['rule_type'],
                        'discount_type'       => $ruleData['discount_type'],
                        'discount_value'      => (float) $ruleData['discount_value'],
                        'min_qty'             => $ruleData['min_qty'] ?? null,
                        'max_qty'             => $ruleData['max_qty'] ?? null,
                        'min_subtotal'        => $ruleData['min_subtotal'] ?? null,
                        'max_subtotal'        => $ruleData['max_subtotal'] ?? null,
                        'max_discount_amount' => $ruleData['max_discount_amount'] ?? null,
                        'priority'            => (int) ($ruleData['priority'] ?? 10),
                        'is_stackable'        => $ruleData['is_stackable'] ?? true,
                        'is_active'           => $ruleData['is_active'] ?? true,
                    ]);

                    if (!empty($ruleData['product_ids'])) {
                        $rule->products()->sync($ruleData['product_ids']);
                    }
                    if (!empty($ruleData['category_ids'])) {
                        $rule->categories()->sync($ruleData['category_ids']);
                    }
                    if (!empty($ruleData['brand_ids'])) {
                        $rule->brands()->sync($ruleData['brand_ids']);
                    }
                }
            } elseif ($request->filled('discount_value') || $request->filled('rewards.discount_value') || $request->filled('type')) {
                // Auto-create primary rule from flat/preset form inputs
                $discValue = (float) ($request->input('discount_value') ?? $request->input('rewards.discount_value') ?? 0);
                $rawType   = $request->input('discount_type') ?? $request->input('type') ?? 'percentage';
                $discType  = in_array($rawType, ['percentage', 'fixed_amount', 'fixed_price', 'free_item', 'free_shipping']) ? $rawType : 'percentage';
                $ruleType  = $request->input('rule_type') ?? ($discType === 'fixed_amount' || $discType === 'percentage' ? 'cart_discount' : 'product_discount');

                $campaign->rules()->create([
                    'name'                => $campaign->name . ' Rule',
                    'rule_type'           => $ruleType,
                    'discount_type'       => $discType,
                    'discount_value'      => $discValue,
                    'min_qty'             => $request->input('min_quantity') ?? $request->input('conditions.min_quantity'),
                    'min_subtotal'        => $request->input('min_spend_usd') ?? $request->input('conditions.min_spend_usd'),
                    'max_discount_amount' => $request->input('max_discount_cap') ?? $request->input('rewards.max_discount_cap'),
                    'priority'            => (int) ($campaign->priority ?? 10),
                    'is_stackable'        => (bool) ($campaign->is_stackable ?? true),
                    'is_active'           => true,
                ]);
            }

            // Create Coupons
            if (!empty($validated['coupons'])) {
                foreach ($validated['coupons'] as $couponData) {
                    $campaign->coupons()->create([
                        'code'               => strtoupper(trim($couponData['code'])),
                        'usage_limit'        => $couponData['usage_limit'] ?? null,
                        'usage_per_customer' => $couponData['usage_per_customer'] ?? 1,
                        'starts_at'          => $couponData['starts_at'] ?? $campaign->start_at,
                        'expires_at'         => $couponData['expires_at'] ?? $campaign->end_at,
                        'is_active'          => true,
                    ]);
                }
            }

            return $campaign->load(['branches', 'channels', 'customerGroups', 'rules.products', 'rules.categories', 'rules.brands', 'coupons']);
        });

        return $this->successResponse($campaign, 'Promotion campaign created successfully', 201);
    }

    /**
     * Update an existing promotion campaign.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $campaign = PromotionCampaign::where('company_id', $companyId)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'name'                 => 'sometimes|required|string|max:191',
            'code'                 => ['sometimes', 'required', 'string', 'max:50', Rule::unique('promotion_campaigns', 'code')->ignore($campaign->id)->where('company_id', $companyId)],
            'description'          => 'nullable|string|max:2000',
            'status'               => 'sometimes|string|in:draft,scheduled,active,paused,expired,cancelled',
            'start_at'             => 'nullable|date',
            'end_at'               => 'nullable|date|after_or_equal:start_at',
            'priority'             => 'sometimes|integer|min:0|max:1000',
            'is_stackable'         => 'sometimes|boolean',
            'is_active'            => 'sometimes|boolean',
            'usage_limit'          => 'nullable|integer|min:1',
            'branch_ids'           => 'nullable|array',
            'branch_ids.*'         => 'integer|exists:branches,id',
            'channels'             => 'nullable|array',
            'channels.*'           => 'string|in:pos,web,mobile,all',
            'customer_group_ids'   => 'nullable|array',
            'customer_group_ids.*' => 'integer|exists:customer_groups,id',
            'rules'                => 'nullable|array',
            'rules.*.name'         => 'required|string|max:191',
            'rules.*.rule_type'    => 'required|string',
            'rules.*.discount_type'=> 'required|string',
            'rules.*.discount_value'=> 'required|numeric|min:0',
            'rules.*.min_qty'      => 'nullable|numeric|min:0',
            'rules.*.max_qty'      => 'nullable|numeric|min:0',
            'rules.*.min_subtotal' => 'nullable|numeric|min:0',
            'rules.*.max_subtotal' => 'nullable|numeric|min:0',
            'rules.*.max_discount_amount' => 'nullable|numeric|min:0',
            'rules.*.priority'     => 'nullable|integer',
            'rules.*.is_stackable' => 'nullable|boolean',
            'rules.*.is_active'    => 'nullable|boolean',
            'rules.*.product_ids'  => 'nullable|array',
            'rules.*.category_ids' => 'nullable|array',
            'rules.*.brand_ids'    => 'nullable|array',
        ]);

        DB::transaction(function () use ($campaign, $validated, $user) {
            $campaign->update(array_merge(
                $validated,
                ['updated_by' => $user?->id]
            ));

            if (isset($validated['branch_ids'])) {
                $campaign->branches()->sync($validated['branch_ids']);
            }

            if (isset($validated['channels'])) {
                $campaign->channels()->delete();
                foreach ($validated['channels'] as $ch) {
                    $campaign->channels()->create(['channel' => $ch]);
                }
            }

            if (isset($validated['customer_group_ids'])) {
                $campaign->customerGroups()->sync($validated['customer_group_ids']);
            }

            if (isset($validated['rules'])) {
                // Remove old rules & recreate
                $campaign->rules()->delete();
                foreach ($validated['rules'] as $ruleData) {
                    $rule = $campaign->rules()->create([
                        'name'                => $ruleData['name'],
                        'rule_type'           => $ruleData['rule_type'],
                        'discount_type'       => $ruleData['discount_type'],
                        'discount_value'      => (float) $ruleData['discount_value'],
                        'min_qty'             => $ruleData['min_qty'] ?? null,
                        'max_qty'             => $ruleData['max_qty'] ?? null,
                        'min_subtotal'        => $ruleData['min_subtotal'] ?? null,
                        'max_subtotal'        => $ruleData['max_subtotal'] ?? null,
                        'max_discount_amount' => $ruleData['max_discount_amount'] ?? null,
                        'priority'            => (int) ($ruleData['priority'] ?? 10),
                        'is_stackable'        => $ruleData['is_stackable'] ?? true,
                        'is_active'           => $ruleData['is_active'] ?? true,
                    ]);

                    if (!empty($ruleData['product_ids'])) {
                        $rule->products()->sync($ruleData['product_ids']);
                    }
                    if (!empty($ruleData['category_ids'])) {
                        $rule->categories()->sync($ruleData['category_ids']);
                    }
                    if (!empty($ruleData['brand_ids'])) {
                        $rule->brands()->sync($ruleData['brand_ids']);
                    }
                }
            }
        });

        return $this->successResponse(
            $campaign->load(['branches', 'channels', 'customerGroups', 'rules.products', 'rules.categories', 'rules.brands', 'coupons']),
            'Campaign updated successfully'
        );
    }

    /**
     * Delete campaign.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $campaign = PromotionCampaign::where('company_id', $companyId)->where('id', $id)->firstOrFail();
        $campaign->delete();

        return $this->successResponse(null, 'Campaign deleted successfully');
    }

    /**
     * Get usage history for this campaign.
     */
    public function usages(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $campaign = PromotionCampaign::where('company_id', $companyId)->where('id', $id)->firstOrFail();

        $usages = PromotionUsage::where('promotion_campaign_id', $campaign->id)
            ->with([
                'customer:id,name,phone,email',
                'branch:id,name,code',
                'sale:id,invoice_number,grand_total',
                'order:id,order_number,grand_total',
                'coupon:id,code',
            ])
            ->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 20));

        return $this->successResponse($usages, 'Usage history retrieved successfully');
    }
}
