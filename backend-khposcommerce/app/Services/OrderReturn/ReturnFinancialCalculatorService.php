<?php

namespace App\Services\OrderReturn;

use App\Models\Order\Order;
use App\Models\Order\OrderItem;

class ReturnFinancialCalculatorService
{
    /**
     * Compute pro-rata discount, tax, and net refund for items in a partial or full return.
     *
     * @param Order $order
     * @param array $returnItemsInput [ ['order_item_id' => 1, 'quantity' => 1, 'serial_number' => '...'], ... ]
     * @param string $fault 'customer' or 'store'
     * @param array $fees ['restocking_fee' => 0, 'return_shipping_fee' => 0]
     * @return array
     */
    public function calculateReturnFinancials(
        Order $order,
        array $returnItemsInput,
        string $fault = 'customer',
        array $fees = []
    ): array {
        $orderSubtotal = (float)$order->subtotal;
        $orderDiscount = (float)$order->discount_amount;
        $orderTax = (float)$order->tax_amount;

        $calculatedItems = [];
        $totalItemsRefund = 0;
        $totalAllocatedDiscount = 0;
        $totalAllocatedTax = 0;
        $subtotalSum = 0;

        foreach ($returnItemsInput as $input) {
            $orderItem = OrderItem::findOrFail($input['order_item_id']);
            $returnQty = (float)$input['quantity'];
            $unitPrice = (float)$orderItem->unit_price;

            // Line subtotal for returned quantity
            $lineSubtotal = round($unitPrice * $returnQty, 2);
            $subtotalSum += $lineSubtotal;

            // Pro-rata discount allocation:
            // ItemDiscount = TotalOrderDiscount * (LineSubtotal / OrderSubtotal)
            $allocatedDiscount = 0.00;
            if ($orderSubtotal > 0 && $orderDiscount > 0) {
                $discountProportion = $lineSubtotal / $orderSubtotal;
                $allocatedDiscount = round($orderDiscount * $discountProportion, 2);
            }

            // Pro-rata tax allocation:
            // Net of discount line total * effective tax rate
            $effectiveTaxRate = $orderSubtotal > 0 ? ($orderTax / $orderSubtotal) : 0;
            $netBeforeTax = max(0, $lineSubtotal - $allocatedDiscount);
            $allocatedTax = round($netBeforeTax * $effectiveTaxRate, 2);

            // Total net refund for this item line
            $itemNetRefund = round($netBeforeTax + $allocatedTax, 2);

            $calculatedItems[] = [
                'order_item_id'          => $orderItem->id,
                'product_id'             => $orderItem->product_id,
                'product_variant_id'     => $orderItem->product_variant_id,
                'quantity_requested'     => $returnQty,
                'unit_price'             => $unitPrice,
                'line_subtotal'          => $lineSubtotal,
                'allocated_discount'     => $allocatedDiscount,
                'allocated_tax'          => $allocatedTax,
                'net_unit_refund'        => round($itemNetRefund / max(1, $returnQty), 2),
                'total_refund'           => $itemNetRefund,
                'sold_serial_number'     => $input['sold_serial_number'] ?? null,
                'returned_serial_number' => $input['returned_serial_number'] ?? null,
                'notes'                  => $input['notes'] ?? null,
            ];

            $totalItemsRefund += $itemNetRefund;
            $totalAllocatedDiscount += $allocatedDiscount;
            $totalAllocatedTax += $allocatedTax;
        }

        $restockingFee = (float)($fees['restocking_fee'] ?? 0);
        $returnShippingFee = (float)($fees['return_shipping_fee'] ?? 0);

        // If store fault, fees are 0
        if (strtolower($fault) === 'store') {
            $restockingFee = 0.00;
            $returnShippingFee = 0.00;
        }

        // Net Customer Refund = Items Net Refund - Restocking Fee - Return Shipping Fee
        $netRefundAmount = max(0, round($totalItemsRefund - $restockingFee - $returnShippingFee, 2));

        return [
            'subtotal_amount'           => $subtotalSum,
            'allocated_discount_amount' => $totalAllocatedDiscount,
            'tax_amount'                => $totalAllocatedTax,
            'restocking_fee'            => $restockingFee,
            'return_shipping_fee'       => $returnShippingFee,
            'total_refund_amount'       => $netRefundAmount,
            'items'                     => $calculatedItems,
        ];
    }

    /**
     * Compute exchange balance differential between old returned credit and new desired product.
     */
    public function calculateExchangeDifferential(
        float $oldItemCredit,
        float $newProductPrice,
        float $newProductTax = 0.00,
        float $exchangeFee = 0.00,
        float $replacementShipping = 0.00,
        string $fault = 'customer'
    ): array {
        if (strtolower($fault) === 'store') {
            $exchangeFee = 0.00;
            $replacementShipping = 0.00;
        }

        $newTotal = round($newProductPrice + $newProductTax, 2);
        $netDifference = round($newTotal - $oldItemCredit, 2);

        // Net Balance = (NewTotal - OldCredit) + ExchangeFee + ReplacementShipping
        $totalBalance = round($netDifference + $exchangeFee + $replacementShipping, 2);

        $customerBalanceDue = 0.00;
        $storeRefundDue = 0.00;

        if ($totalBalance > 0) {
            $customerBalanceDue = $totalBalance;
        } else {
            $storeRefundDue = abs($totalBalance);
        }

        return [
            'old_items_credit'     => $oldItemCredit,
            'new_items_cost'       => $newTotal,
            'price_difference'     => $netDifference,
            'exchange_fee'         => $exchangeFee,
            'shipping_difference'  => $replacementShipping,
            'customer_balance_due' => $customerBalanceDue,
            'store_refund_due'     => $storeRefundDue,
        ];
    }
}
