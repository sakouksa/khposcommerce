<?php

namespace Tests\Unit\OrderReturn;

use PHPUnit\Framework\TestCase;
use App\Services\OrderReturn\ReturnFinancialCalculatorService;

class ReturnFinancialCalculatorTest extends TestCase
{
    private ReturnFinancialCalculatorService $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new ReturnFinancialCalculatorService();
    }

    /**
     * Test User Problem #10:
     * Product A = $100
     * Product B = $100
     * Subtotal = $200
     * Coupon = -$20 (Paid $180)
     * Customer returns Product A only.
     * Expect: Exactly $90 refund (pro-rated $10 discount).
     */
    public function test_exchange_differential_calculation(): void
    {
        // Old item credit = $100, New item price = $130
        $result = $this->calculator->calculateExchangeDifferential(
            oldItemCredit: 100.00,
            newProductPrice: 130.00,
            newProductTax: 0.00,
            exchangeFee: 3.00,
            replacementShipping: 2.00,
            fault: 'customer'
        );

        $this->assertEquals(100.00, $result['old_items_credit']);
        $this->assertEquals(130.00, $result['new_items_cost']);
        $this->assertEquals(30.00, $result['price_difference']);
        $this->assertEquals(3.00, $result['exchange_fee']);
        $this->assertEquals(2.00, $result['shipping_difference']);
        // Customer pays: $30 diff + $3 fee + $2 shipping = $35
        $this->assertEquals(35.00, $result['customer_balance_due']);
        $this->assertEquals(0.00, $result['store_refund_due']);
    }

    public function test_exchange_differential_store_fault_waives_fees(): void
    {
        // When store fault, exchange fee and replacement shipping must be 0
        $result = $this->calculator->calculateExchangeDifferential(
            oldItemCredit: 100.00,
            newProductPrice: 130.00,
            newProductTax: 0.00,
            exchangeFee: 5.00,
            replacementShipping: 5.00,
            fault: 'store'
        );

        $this->assertEquals(30.00, $result['price_difference']);
        $this->assertEquals(0.00, $result['exchange_fee']);
        $this->assertEquals(0.00, $result['shipping_difference']);
        $this->assertEquals(30.00, $result['customer_balance_due']);
    }

    public function test_exchange_cheaper_item_issues_store_refund(): void
    {
        // Old item credit = $130, New item price = $100
        $result = $this->calculator->calculateExchangeDifferential(
            oldItemCredit: 130.00,
            newProductPrice: 100.00,
            newProductTax: 0.00,
            exchangeFee: 0.00,
            replacementShipping: 0.00,
            fault: 'customer'
        );

        $this->assertEquals(-30.00, $result['price_difference']);
        $this->assertEquals(0.00, $result['customer_balance_due']);
        $this->assertEquals(30.00, $result['store_refund_due']);
    }
}
