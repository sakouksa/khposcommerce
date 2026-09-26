<?php

namespace App\Services\Chatbot\Tools;

use App\Models\CMS\Faq;
use App\Models\CMS\Page;
use App\Models\Chatbot\ChatSupportRequest;
use App\Models\Customer\Customer;
use App\Services\Telegram\TelegramNotificationService;

class SupportTool
{
    public function __construct(
        private readonly ?TelegramNotificationService $telegramNotifier = null
    ) {}

    /**
     * Search official FAQs and Knowledge base pages.
     */
    public function searchFaq(array $params): array
    {
        $query = trim($params['query'] ?? '');

        $faqs = Faq::where('is_active', true)
            ->when($query, function ($q) use ($query) {
                $q->where('question', 'like', "%{$query}%")
                  ->orWhere('answer', 'like', "%{$query}%")
                  ->orWhere('category', 'like', "%{$query}%");
            })
            ->limit(4)
            ->get();

        $pages = Page::where('status', 'published')
            ->when($query, function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->limit(2)
            ->get();

        return [
            'faqs' => $faqs->map(fn ($f) => [
                'question' => $f->question,
                'answer'   => $f->answer,
                'category' => $f->category,
            ])->toArray(),
            'pages' => $pages->map(fn ($p) => [
                'title'   => $p->title,
                'excerpt' => mb_substr(strip_tags($p->content), 0, 300) . '...',
                'slug'    => $p->slug,
            ])->toArray(),
        ];
    }

    /**
     * Escalate an issue and create a Human Support Request.
     */
    public function createSupportRequest(array $params, array $context): array
    {
        $message = trim($params['message'] ?? $params['issue'] ?? 'Customer requested live human support');
        $subject = trim($params['subject'] ?? 'Support Inquiry');
        $orderId = $params['order_id'] ?? null;
        $customerName = $params['customer_name'] ?? $context['user_name'] ?? 'Visitor';
        $contact = $params['contact_info'] ?? $params['phone_or_email'] ?? 'Not provided';

        $customerId = $context['customer_id'] ?? null;
        $userId = $context['user_id'] ?? null;
        $sessionId = $context['chat_session_id'] ?? null;

        $supportRequest = ChatSupportRequest::create([
            'chat_session_id'  => $sessionId,
            'customer_id'      => $customerId,
            'user_id'          => $userId,
            'order_id'         => $orderId,
            'channel'          => $context['channel'] ?? 'web',
            'customer_name'    => $customerName,
            'customer_contact' => $contact,
            'subject'          => $subject,
            'message'          => $message,
            'status'           => 'pending',
        ]);

        // Dispatch instant Telegram alert to admin/staff
        if ($this->telegramNotifier) {
            $this->telegramNotifier->sendSupportEscalationAlert($supportRequest);
        }

        return [
            'success'            => true,
            'ticket_id'          => 'TKT-' . str_pad($supportRequest->id, 5, '0', STR_PAD_LEFT),
            'message'            => 'Your support request has been escalated to our human team. A specialist will follow up shortly.',
            'support_request_id' => $supportRequest->id,
        ];
    }
}
