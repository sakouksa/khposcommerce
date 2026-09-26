<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationUser;
use App\Models\Notification\NotificationTemplate;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Database\Seeders\NotificationSeeder;
use Database\Seeders\RolesPermissionsSeeder;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesPermissionsSeeder::class);
        $this->seed(NotificationSeeder::class);

        $this->user = User::factory()->create(['is_active' => true]);
        $permissions = Permission::pluck('name')->toArray();
        $this->user->givePermissionTo($permissions);

        $jwtService = app(JwtTokenService::class);
        $jwtRes = $jwtService->generateAccessToken($this->user);
        $this->token = $jwtRes['token'];
    }

    protected function authHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ];
    }

    public function test_can_list_notifications()
    {
        $response = $this->withHeaders($this->authHeaders())
                         ->getJson('/api/v1/notifications');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data',
                     'pagination' => ['total', 'per_page', 'current_page']
                 ]);
    }

    public function test_can_get_unread_notifications()
    {
        $response = $this->withHeaders($this->authHeaders())
                         ->getJson('/api/v1/notifications/unread');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'unread_count',
                     'data'
                 ]);
    }

    public function test_can_create_and_dispatch_notification()
    {
        $payload = [
            'type' => 'sales',
            'title' => 'Test Sale Notification',
            'message' => 'Sale #SO-9999 has been placed.',
            'priority' => 'high',
            'is_global' => true,
        ];

        $response = $this->withHeaders($this->authHeaders())
                         ->postJson('/api/v1/notifications', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('success', true)
                 ->assertJsonPath('data.title', 'Test Sale Notification');

        $this->assertDatabaseHas('notifications', [
            'title' => 'Test Sale Notification',
            'priority' => 'high',
        ]);
    }

    public function test_can_mark_notification_as_read()
    {
        $notification = Notification::create([
            'title' => 'Test Read',
            'message' => 'Test Message',
            'priority' => 'normal',
            'type' => 'system',
            'is_global' => true,
        ]);

        $response = $this->withHeaders($this->authHeaders())
                         ->putJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_manage_notification_templates()
    {
        $payload = [
            'code' => 'TEST_TMPL_' . rand(1000, 9999),
            'name' => 'Test Template Name',
            'title_template' => 'Hello {name}',
            'message_template' => 'Your order {code} is ready',
            'type' => 'sales',
            'priority' => 'normal',
            'is_active' => true,
        ];

        // Create
        $response = $this->withHeaders($this->authHeaders())
                         ->postJson('/api/v1/notification-templates', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('success', true);

        $tmplId = $response->json('data.id');

        // Update
        $updateResponse = $this->withHeaders($this->authHeaders())
                               ->putJson("/api/v1/notification-templates/{$tmplId}", [
                                   'name' => 'Updated Template Name',
                               ]);

        $updateResponse->assertStatus(200)
                       ->assertJsonPath('data.name', 'Updated Template Name');

        // Delete
        $deleteResponse = $this->withHeaders($this->authHeaders())
                               ->deleteJson("/api/v1/notification-templates/{$tmplId}");

        $deleteResponse->assertStatus(200);
    }
}
