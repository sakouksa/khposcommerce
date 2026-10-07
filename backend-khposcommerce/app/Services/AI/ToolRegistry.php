<?php

namespace App\Services\AI;

use App\Services\Chatbot\Tools\ProductTool;
use App\Services\Chatbot\Tools\CartTool;
use App\Services\Chatbot\Tools\OrderTool;
use App\Services\Chatbot\Tools\ShippingTool;
use App\Services\Chatbot\Tools\PaymentTool;
use App\Services\Chatbot\Tools\SupportTool;
use Illuminate\Support\Facades\Log;

class ToolRegistry
{
    public function __construct(
        private readonly ProductTool $productTool,
        private readonly CartTool $cartTool,
        private readonly OrderTool $orderTool,
        private readonly ShippingTool $shippingTool,
        private readonly PaymentTool $paymentTool,
        private readonly SupportTool $supportTool,
    ) {}

    /**
     * Get OpenAI function calling tools schema definitions.
     */
    public function getToolDefinitions(): array
    {
        return [
            // ── Products ──
            [
                'type' => 'function',
                'function' => [
                    'name' => 'search_products',
                    'description' => 'Search products in the catalog by keyword, category name, brand name, price range, or stock status.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => ['type' => 'string', 'description' => 'Keywords to search (e.g. "iPhone", "wireless headset", "shoes")'],
                            'category' => ['type' => 'string', 'description' => 'Category filter'],
                            'brand' => ['type' => 'string', 'description' => 'Brand filter'],
                            'min_price' => ['type' => 'number', 'description' => 'Minimum price'],
                            'max_price' => ['type' => 'number', 'description' => 'Maximum price'],
                            'in_stock_only' => ['type' => 'boolean', 'description' => 'Only return items currently in stock'],
                            'limit' => ['type' => 'integer', 'description' => 'Max number of items to return (default 6)'],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_product_details',
                    'description' => 'Retrieve detailed information for a specific product including price, stock, variants, description, and reviews.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'product_id' => ['type' => 'integer', 'description' => 'Unique ID of the product'],
                            'slug' => ['type' => 'string', 'description' => 'URL slug of the product'],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'check_product_stock',
                    'description' => 'Check the exact real-time available stock for a product or variant.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'product_id' => ['type' => 'integer', 'description' => 'Product ID to check stock for'],
                            'product_variant_id' => ['type' => 'integer', 'description' => 'Optional variant ID'],
                        ],
                        'required' => ['product_id'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'recommend_products',
                    'description' => 'Get curated product recommendations such as featured items, best sellers, or deals.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'type' => [
                                'type' => 'string',
                                'enum' => ['featured', 'deals', 'popular'],
                                'description' => 'Type of recommendations to fetch',
                            ],
                            'category_id' => ['type' => 'integer', 'description' => 'Optional category ID'],
                            'limit' => ['type' => 'integer', 'description' => 'Number of recommendations (default 4)'],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'compare_products',
                    'description' => 'Compare specs, pricing, and stock of multiple products side by side.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'product_ids' => [
                                'type' => 'array',
                                'items' => ['type' => 'integer'],
                                'description' => 'List of product IDs to compare',
                            ],
                        ],
                        'required' => ['product_ids'],
                    ],
                ],
            ],

            // ── Cart ──
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_cart',
                    'description' => 'Get current items, subtotal, and total in the customer shopping cart.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => new \stdClass(),
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'add_to_cart',
                    'description' => 'Add a product or variant to the shopping cart.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'product_id' => ['type' => 'integer', 'description' => 'Product ID to add'],
                            'product_variant_id' => ['type' => 'integer', 'description' => 'Optional variant ID'],
                            'quantity' => ['type' => 'number', 'description' => 'Quantity to add (default 1)'],
                        ],
                        'required' => ['product_id'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'remove_from_cart',
                    'description' => 'Remove an item from the shopping cart.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'cart_item_id' => ['type' => 'integer', 'description' => 'Cart Item ID to remove'],
                            'product_id' => ['type' => 'integer', 'description' => 'Product ID to remove'],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'update_cart_quantity',
                    'description' => 'Change the quantity of an item in the cart.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'product_id' => ['type' => 'integer', 'description' => 'Product ID to update'],
                            'cart_item_id' => ['type' => 'integer', 'description' => 'Cart Item ID to update'],
                            'quantity' => ['type' => 'number', 'description' => 'New quantity'],
                        ],
                        'required' => ['quantity'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'clear_cart',
                    'description' => 'Clear all items from the shopping cart.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => new \stdClass(),
                    ],
                ],
            ],

            // ── Orders ──
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_order_status',
                    'description' => 'Track order fulfillment status, carrier details, and tracking number by order number.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'order_number' => ['type' => 'string', 'description' => 'Order number (e.g. ORD-1025)'],
                        ],
                        'required' => ['order_number'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_order_history',
                    'description' => 'Retrieve list of recent orders for the currently authenticated customer.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'limit' => ['type' => 'integer', 'description' => 'Max number of orders to return'],
                        ],
                    ],
                ],
            ],

            // ── Shipping & Payment ──
            [
                'type' => 'function',
                'function' => [
                    'name' => 'calculate_shipping',
                    'description' => 'Calculate shipping cost based on city destination and weight.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'city' => ['type' => 'string', 'description' => 'Destination city name'],
                            'weight' => ['type' => 'number', 'description' => 'Weight in kilograms'],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_shipping_methods',
                    'description' => 'Get all active shipping methods and providers.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => new \stdClass(),
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_payment_methods',
                    'description' => 'Get all accepted payment methods and payment instructions (KHQR, ABA, Credit Card, COD).',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => new \stdClass(),
                    ],
                ],
            ],

            // ── Support & FAQ ──
            [
                'type' => 'function',
                'function' => [
                    'name' => 'search_faq',
                    'description' => 'Search official store FAQs, return policy, warranty terms, and store policies.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => ['type' => 'string', 'description' => 'Search query (e.g., "return policy", "warranty", "store hours")'],
                        ],
                        'required' => ['query'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'create_support_request',
                    'description' => 'Escalate a customer issue or complaint to human customer support agents.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'message' => ['type' => 'string', 'description' => 'Detailed description of the customer issue'],
                            'subject' => ['type' => 'string', 'description' => 'Brief subject'],
                            'order_id' => ['type' => 'integer', 'description' => 'Optional related order ID'],
                            'customer_name' => ['type' => 'string', 'description' => 'Customer name'],
                            'contact_info' => ['type' => 'string', 'description' => 'Customer phone or email contact'],
                        ],
                        'required' => ['message'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Execute a tool by name with arguments and context.
     */
    public function execute(string $name, array $arguments, array $context = []): array
    {
        Log::info("Executing AI Tool: {$name}", ['arguments' => $arguments]);

        try {
            return match ($name) {
                'search_products', 'get_category_products', 'get_brand_products'
                    => $this->productTool->searchProducts($arguments),
                'get_product_details'
                    => $this->productTool->getProductDetails($arguments),
                'check_product_stock', 'get_product_price'
                    => $this->productTool->checkProductStock($arguments),
                'recommend_products'
                    => $this->productTool->recommendProducts($arguments),
                'compare_products'
                    => $this->productTool->compareProducts($arguments),

                'get_cart'
                    => $this->cartTool->getCart($arguments, $context),
                'add_to_cart'
                    => $this->cartTool->addToCart($arguments, $context),
                'remove_from_cart'
                    => $this->cartTool->removeFromCart($arguments, $context),
                'update_cart_quantity'
                    => $this->cartTool->updateCartQuantity($arguments, $context),
                'clear_cart'
                    => $this->cartTool->clearCart($arguments, $context),

                'get_order_status', 'get_order'
                    => $this->orderTool->getOrderStatus($arguments, $context),
                'get_order_history'
                    => $this->orderTool->getOrderHistory($arguments, $context),

                'calculate_shipping'
                    => $this->shippingTool->calculateShipping($arguments),
                'get_shipping_methods'
                    => $this->shippingTool->getShippingMethods($arguments),

                'get_payment_methods'
                    => $this->paymentTool->getPaymentMethods($arguments),

                'search_faq'
                    => $this->supportTool->searchFaq($arguments),
                'create_support_request'
                    => $this->supportTool->createSupportRequest($arguments, $context),

                default => [
                    'error' => "Unknown tool: {$name}",
                ],
            };
        } catch (\Throwable $e) {
            Log::error("AI Tool {$name} execution failed: " . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
            ]);

            return [
                'error'   => 'Tool execution failed',
                'message' => $e->getMessage(),
            ];
        }
    }
}
