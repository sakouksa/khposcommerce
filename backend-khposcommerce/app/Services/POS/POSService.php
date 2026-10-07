<?php

namespace App\Services\POS;

use App\Models\Sales\Sale;
use App\Services\Sales\SaleService;

class POSService
{
    public function __construct(protected ?SaleService $saleService = null)
    {
    }

    public function processQuickSale(array $saleData, array $items = []): Sale
    {
        return $this->saleService ? $this->saleService->create($saleData, $items) : Sale::create($saleData);
    }
}
