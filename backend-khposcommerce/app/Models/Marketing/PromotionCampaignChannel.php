<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionCampaignChannel extends Model
{
    protected $table = 'promotion_campaign_channels';

    protected $fillable = [
        'promotion_campaign_id',
        'channel',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(PromotionCampaign::class, 'promotion_campaign_id');
    }
}
