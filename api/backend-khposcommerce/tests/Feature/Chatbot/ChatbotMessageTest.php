<?php

namespace Tests\Feature\Chatbot;

use Tests\TestCase;
use App\Models\Customer\Customer;
use App\Models\Product\Product;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Chatbot\ChatSession;
use App\Models\Chatbot\ChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChatbotMessageTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private Branch $branch;
    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'      => 'Enterprise Store Test',
            'slug'      => 'enterprise-store-test',
            'is_active' => true,
        ]);

        $this->branch = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Main Branch',
            'code'       => 'BR-01',
            'is_active'  => true,
        ]);

        $this->store = Store::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branch->id,
            'name'       => 'Main Flagship Store',
            'code'       => 'STORE-01',
            'slug'       => 'main-flagship-store',
            'is_active'  => true,
        ]);
    }

    public function test_can_send_chat_message_as_guest(): void
    {
        $response = $this->postJson('/api/v1/customer/chat/message', [
            'message' => 'Hello, I want to find products under $500',
        ], [
            'X-Session-ID' => 'guest_test_session_123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'session_id',
                    'session_token',
                    'role',
                    'content',
                    'metadata',
                ],
            ]);

        $this->assertDatabaseHas('chat_sessions', [
            'session_token' => 'guest_test_session_123',
            'channel'       => 'web',
        ]);

        $this->assertDatabaseHas('chat_messages', [
            'role'    => 'user',
            'content' => 'Hello, I want to find products under $500',
        ]);
    }

    public function test_can_fetch_and_clear_chat_history(): void
    {
        $sessionToken = 'hist_test_session_789';

        $this->postJson('/api/v1/customer/chat/message', [
            'message' => 'What are your deals today?',
        ], [
            'X-Session-ID' => $sessionToken,
        ]);

        $historyRes = $this->getJson("/api/v1/customer/chat/history?session_token={$sessionToken}");
        $historyRes->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $this->assertNotEmpty($historyRes->json('data'));

        $clearRes = $this->deleteJson("/api/v1/customer/chat/history?session_token={$sessionToken}");
        $clearRes->assertStatus(200);

        $emptyRes = $this->getJson("/api/v1/customer/chat/history?session_token={$sessionToken}");
        $this->assertEmpty($emptyRes->json('data'));
    }
}
