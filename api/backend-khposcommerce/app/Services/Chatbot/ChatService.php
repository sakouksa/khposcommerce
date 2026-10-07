<?php

namespace App\Services\Chatbot;

use App\Models\Chatbot\ChatSession;
use App\Models\Chatbot\ChatMessage;
use App\Models\Customer\Customer;
use App\Models\User;
use App\Services\AI\AIService;
use App\Services\AI\PromptService;
use App\Services\AI\ToolRegistry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatService
{
    public function __construct(
        private readonly AIService $aiService,
        private readonly PromptService $promptService,
        private readonly ToolRegistry $toolRegistry,
    ) {}

    /**
     * Resolve or create a chat session for web or telegram.
     */
    public function resolveSession(
        string $channel = 'web',
        ?string $sessionToken = null,
        ?int $userId = null,
        ?int $customerId = null
    ): ChatSession {
        $token = $sessionToken ?: ('sess_' . Str::random(24));

        $session = ChatSession::where('channel', $channel)
            ->where('session_token', $token)
            ->first();

        if ($session) {
            // Update user or customer association if newly logged in
            if ($userId && !$session->user_id) {
                $session->user_id = $userId;
            }
            if ($customerId && !$session->customer_id) {
                $session->customer_id = $customerId;
            }
            $session->save();
            return $session;
        }

        return ChatSession::create([
            'channel'         => $channel,
            'session_token'   => $token,
            'user_id'         => $userId,
            'customer_id'     => $customerId,
            'title'           => 'Shopping Session',
            'status'          => 'active',
            'last_message_at' => now(),
        ]);
    }

    /**
     * Process an incoming message and return an AI assistant response with structured UI metadata.
     */
    public function sendMessage(
        string $messageText,
        string $channel = 'web',
        ?string $sessionToken = null,
        ?User $user = null,
        ?Customer $customer = null,
        ?string $language = null
    ): array {
        $userId = $user?->id;
        $customerId = $customer?->id ?? ($user ? Customer::where('user_id', $user->id)->value('id') : null);

        $session = $this->resolveSession($channel, $sessionToken, $userId, $customerId);

        // 1. Record incoming user message
        $userMsg = ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'user',
            'content'         => $messageText,
        ]);

        $session->update(['last_message_at' => now()]);

        // 2. Prepare Context for AI & Tools
        $context = [
            'chat_session_id' => $session->id,
            'session_token'   => $session->session_token,
            'session_id'      => $session->session_token,
            'channel'         => $channel,
            'language'        => $language,
            'user_id'         => $userId,
            'customer_id'     => $customerId,
            'user_name'       => $customer?->name ?? $user?->name ?? null,
            'currency'        => 'USD',
        ];

        // 3. Build messages history (System prompt + recent 10 messages)
        $systemPrompt = $this->promptService->getSystemPrompt($context);
        $recentMessages = $session->messages()
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get()
            ->reverse();

        $aiMessages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($recentMessages as $msg) {
            $entry = ['role' => $msg->role, 'content' => $msg->content ?? ''];
            if ($msg->role === 'tool') {
                $entry['tool_call_id'] = $msg->tool_call_id;
                $entry['name'] = $msg->tool_name;
            }
            $aiMessages[] = $entry;
        }

        // 4. Initial AI completion call
        $aiResponse = $this->aiService->chatCompletion($aiMessages, $context);
        $structuredMetadata = [];

        // 5. Handle Tool Calling Loop (if any)
        if (!empty($aiResponse['tool_calls'])) {
            $toolCalls = $aiResponse['tool_calls'];

            foreach ($toolCalls as $toolCall) {
                $funcName = $toolCall['function']['name'] ?? '';
                $funcArgs = is_string($toolCall['function']['arguments'])
                    ? json_decode($toolCall['function']['arguments'], true) ?? []
                    : ($toolCall['function']['arguments'] ?? []);

                // Execute tool securely
                $toolResult = $this->toolRegistry->execute($funcName, $funcArgs, $context);

                // Collect structured UI metadata for cards
                $this->extractStructuredMetadata($funcName, $toolResult, $structuredMetadata);

                // Record tool message
                ChatMessage::create([
                    'chat_session_id' => $session->id,
                    'role'            => 'tool',
                    'content'         => json_encode($toolResult),
                    'tool_name'       => $funcName,
                    'tool_call_id'    => $toolCall['id'],
                    'tool_arguments'  => $funcArgs,
                ]);

                // Append tool result into AI message history
                $aiMessages[] = [
                    'role'         => 'assistant',
                    'content'      => null,
                    'tool_calls'   => [$toolCall],
                ];

                $aiMessages[] = [
                    'role'         => 'tool',
                    'tool_call_id' => $toolCall['id'],
                    'name'         => $funcName,
                    'content'      => json_encode($toolResult),
                ];
            }

            // Follow-up AI completion with tool output
            $followUpResponse = $this->aiService->chatCompletion($aiMessages, $context);
            $finalAssistantContent = $followUpResponse['content'] ?? 'I have updated your request with the latest information.';
        } else {
            $finalAssistantContent = $aiResponse['content'] ?? 'How can I assist you with your shopping today?';
        }

        // Ensure default quick actions if none attached
        if (empty($structuredMetadata['quick_actions'])) {
            $structuredMetadata['quick_actions'] = [
                ['label' => '🔎 Find Products', 'action' => 'search_products', 'query' => 'Show popular products'],
                ['label' => '🔥 Best Sellers', 'action' => 'recommend_products', 'query' => 'What are your best sellers?'],
                ['label' => '💰 Deals', 'action' => 'deals', 'query' => 'Show me current deals and discounts'],
                ['label' => '📦 Track Order', 'action' => 'track_order', 'query' => 'I want to track my order'],
                ['label' => '💬 Human Support', 'action' => 'support', 'query' => 'I need help from support'],
            ];
        }

        // 6. Record Assistant Message in DB
        $assistantMsg = ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'assistant',
            'content'         => $finalAssistantContent,
            'metadata'        => $structuredMetadata,
        ]);

        return [
            'session_id'    => $session->id,
            'session_token' => $session->session_token,
            'message_id'    => $assistantMsg->id,
            'role'          => 'assistant',
            'content'       => $finalAssistantContent,
            'metadata'      => $structuredMetadata,
            'created_at'    => $assistantMsg->created_at->toIso8601String(),
        ];
    }

    /**
     * Extract structured UI payloads from tool results.
     */
    private function extractStructuredMetadata(string $toolName, array $toolResult, array &$structuredMetadata): void
    {
        switch ($toolName) {
            case 'search_products':
            case 'recommend_products':
                if (!empty($toolResult['products'])) {
                    $structuredMetadata['type'] = 'products';
                    $structuredMetadata['products'] = $toolResult['products'];
                }
                break;

            case 'get_product_details':
                if (!empty($toolResult['product'])) {
                    $structuredMetadata['type'] = 'product_detail';
                    $structuredMetadata['product'] = $toolResult['product'];
                }
                break;

            case 'add_to_cart':
            case 'get_cart':
            case 'update_cart_quantity':
            case 'remove_from_cart':
                $structuredMetadata['type'] = 'cart';
                $structuredMetadata['cart'] = $toolResult;
                break;

            case 'get_order_status':
            case 'get_order':
                if (!empty($toolResult['order'])) {
                    $structuredMetadata['type'] = 'order';
                    $structuredMetadata['order'] = $toolResult['order'];
                }
                break;

            case 'get_order_history':
                if (!empty($toolResult['orders'])) {
                    $structuredMetadata['type'] = 'orders';
                    $structuredMetadata['orders'] = $toolResult['orders'];
                }
                break;

            case 'create_support_request':
                $structuredMetadata['type'] = 'support_escalation';
                $structuredMetadata['ticket'] = $toolResult;
                break;

            case 'get_shipping_methods':
            case 'calculate_shipping':
                $structuredMetadata['type'] = 'shipping';
                $structuredMetadata['shipping'] = $toolResult;
                break;

            case 'get_payment_methods':
                $structuredMetadata['type'] = 'payment_methods';
                $structuredMetadata['payment_methods'] = $toolResult['methods'] ?? [];
                break;
        }
    }

    /**
     * Get message history for a session.
     */
    public function getHistory(string $sessionToken, string $channel = 'web'): array
    {
        $session = ChatSession::where('session_token', $sessionToken)
            ->where('channel', $channel)
            ->first();

        if (!$session) {
            return [];
        }

        return $session->messages()
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'role'       => $m->role,
                'content'    => $m->content,
                'metadata'   => $m->metadata,
                'created_at' => $m->created_at->toIso8601String(),
            ])
            ->toArray();
    }

    /**
     * Clear message history for a session.
     */
    public function clearHistory(string $sessionToken, string $channel = 'web'): bool
    {
        $session = ChatSession::where('session_token', $sessionToken)
            ->where('channel', $channel)
            ->first();

        if (!$session) {
            return false;
        }

        $session->messages()->delete();
        return true;
    }
}
