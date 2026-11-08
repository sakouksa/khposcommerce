<?php

namespace App\Events;

use App\Models\Inventory\StockTransfer;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockTransferred
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public StockTransfer $transfer)
    {
    }
}
