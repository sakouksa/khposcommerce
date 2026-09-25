<?php

namespace Tests\Unit\Domain;

use Tests\TestCase;
use App\Services\Sales\PricingService;

class PricingServiceTest extends TestCase
{
    private PricingService $pricingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pricingService = new PricingService();
    }

    public function test_can_calculate_line_item_with_discount_and_tax(): void
    {
        // 2 items @ $50 = $100 subtotal, 10% discount = $10 ($90 net), 10% tax = $9 -> total $99
        $result = $this->pricingService->calculateLineItem(
            unitPrice: 50.0,
            quantity: 2.0,
            discountPercent: 10.0,
            taxPercent: 10.0
        );

        $this->assertEquals(50.0, $result['unit_price']);
        $this->assertEquals(2.0, $result['quantity']);
        $this->assertEquals(100.0, $result['subtotal']);
        $this->assertEquals(10.0, $result['discount_amount']);
        $this->assertEquals(9.0, $result['tax_amount']);
        $this->assertEquals(99.0, $result['total']);
    }

    public function test_can_calculate_simple_line_item_without_tax_or_discount(): void
    {
        $result = $this->pricingService->calculateLineItem(
            unitPrice: 25.0,
            quantity: 4.0
        );

        $this->assertEquals(100.0, $result['subtotal']);
        $this->assertEquals(0.0, $result['discount_amount']);
        $this->assertEquals(0.0, $result['tax_amount']);
        $this->assertEquals(100.0, $result['total']);
    }
}
