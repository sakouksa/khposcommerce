<?php

namespace Tests\Feature\Telegram;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Customer\Customer;
use App\Models\Chatbot\TelegramUser;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TelegramWebhookTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'      => 'Telegram Store',
            'slug'      => 'telegram-store',
            'is_active' => true,
        ]);
    }

    public function test_telegram_webhook_handles_start_command(): void
    {
        $payload = [
            'update_id' => 10001,
            'message'   => [
                'message_id' => 1,
                'chat'       => [
                    'id'   => 987654321,
                    'type' => 'private',
                ],
                'from' => [
                    'id'         => 987654321,
                    'is_bot'     => false,
                    'first_name' => 'John',
                    'username'   => 'john_doe',
                ],
                'text' => '/start',
            ],
        ];

        $response = $this->postJson('/api/v1/telegram/webhook', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'ok' => true,
            ]);

        $this->assertDatabaseHas('telegram_users', [
            'telegram_id' => 987654321,
            'username'    => 'john_doe',
        ]);
    }

    public function test_telegram_user_can_link_account_via_code(): void
    {
        $customer = Customer::create([
            'company_id' => $this->company->id,
            'name'       => 'Sara Connor',
            'email'      => 'sara@example.com',
            'is_active'  => true,
        ]);

        $code = TelegramUser::generateLinkCode($customer->id);

        // Telegram sends /link <code>
        $payload = [
            'update_id' => 10002,
            'message'   => [
                'message_id' => 2,
                'chat'       => [
                    'id'   => 555666777,
                    'type' => 'private',
                ],
                'from' => [
                    'id'         => 555666777,
                    'first_name' => 'Sara',
                    'username'   => 'saraconnor',
                ],
                'text' => "/link {$code}",
            ],
        ];

        $response = $this->postJson('/api/v1/telegram/webhook', $payload);
        $response->assertStatus(200);

        $tgUser = TelegramUser::where('telegram_id', 555666777)->first();
        $this->assertNotNull($tgUser);
        $this->assertEquals($customer->id, $tgUser->customer_id);
    }
}
