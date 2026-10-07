<?php

namespace Tests\Feature\Chatbot;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Chatbot\ChatSession;
use App\Models\Chatbot\ChatMessage;
use App\Models\Chatbot\ChatSupportRequest;
use App\Models\Chatbot\TelegramUser;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminChatbotDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Company $company;
    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'      => 'Admin Corp',
            'slug'      => 'admin-corp',
            'is_active' => true,
        ]);

        $this->admin = User::factory()->create([
            'company_id' => $this->company->id,
            'is_active'  => true,
        ]);

        $jwtService = app(JwtTokenService::class);
        $tokenData = $jwtService->generateAccessToken($this->admin);
        $this->headers = [
            'Authorization' => 'Bearer ' . $tokenData['token'],
        ];

        $session = ChatSession::create([
            'channel'       => 'web',
            'session_token' => 'sess_admin_test_1',
            'title'         => 'Test Web Session',
            'status'        => 'active',
        ]);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'user',
            'content'         => 'Can you recommend laptops?',
        ]);

        ChatSupportRequest::create([
            'channel'       => 'web',
            'customer_name' => 'John Doe',
            'subject'       => 'Refund request',
            'message'       => 'I want a refund for my order.',
            'status'        => 'pending',
        ]);

        TelegramUser::create([
            'telegram_id' => 99887766,
            'username'    => 'admin_tg_tester',
            'is_active'   => true,
        ]);
    }

    public function test_admin_can_view_chatbot_dashboard_metrics(): void
    {
        $response = $this->getJson('/api/v1/admin/chatbot/dashboard', $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'metrics' => [
                        'total_sessions',
                        'total_messages',
                        'web_sessions',
                        'telegram_sessions',
                        'linked_telegram_users',
                        'pending_support_requests',
                        'total_support_requests',
                    ],
                ],
            ]);

        $this->assertEquals(1, $response->json('data.metrics.total_sessions'));
        $this->assertEquals(1, $response->json('data.metrics.pending_support_requests'));
    }

    public function test_admin_can_filter_sessions_and_view_transcript(): void
    {
        $response = $this->getJson('/api/v1/admin/chatbot/sessions?channel=web', $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'channel', 'session_token', 'status'],
                ],
            ]);

        $sessionId = $response->json('data.0.id');

        $detailRes = $this->getJson("/api/v1/admin/chatbot/sessions/{$sessionId}", $this->headers);

        $detailRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'messages' => [
                        '*' => ['id', 'role', 'content'],
                    ],
                ],
            ]);
    }

    public function test_admin_can_update_support_request_status(): void
    {
        $ticket = ChatSupportRequest::first();

        $response = $this->putJson("/api/v1/admin/chatbot/support-requests/{$ticket->id}", [
            'status'      => 'resolved',
            'admin_notes' => 'Customer refunded manually.',
        ], $this->headers);

        $response->assertStatus(200);

        $ticket->refresh();
        $this->assertEquals('resolved', $ticket->status);
        $this->assertEquals('Customer refunded manually.', $ticket->admin_notes);
    }
}
