<?php

namespace Tests\Feature\Api;

use App\Models\Company\Company;
use App\Models\Product\Category;
use App\Models\User;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Company $company;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->company = Company::create([
            'name' => 'Main Test Company',
            'code' => 'TEST_CO',
            'slug' => 'main-test-company',
            'email' => 'test@company.com',
        ]);

        $this->adminUser = User::create([
            'company_id' => $this->company->id,
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $jwtService = app(JwtTokenService::class);
        $tokenData = $jwtService->generateAccessToken($this->adminUser);
        $this->token = $tokenData['token'];
    }

    public function test_can_list_categories(): void
    {
        Category::create([
            'company_id' => $this->company->id,
            'name' => 'Smartphones',
            'slug' => 'smartphones',
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/categories');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
        ]);
    }

    public function test_can_create_category_with_image_file(): void
    {
        $file = UploadedFile::fake()->image('category_image.png', 400, 400);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/categories', [
                'company_id' => $this->company->id,
                'name' => 'Laptops',
                'description' => 'Portable computers',
                'image_file' => $file,
                'is_active' => true,
            ]);

        $response->assertStatus(201);
        $data = $response->json('data');
        $this->assertNotNull($data['image']);
        $this->assertTrue(Storage::disk('public')->exists($data['image']));
    }

    public function test_updating_category_details_preserves_existing_image(): void
    {
        $file = UploadedFile::fake()->image('old_category.png', 400, 400);
        $storedPath = $file->store('categories', 'public');

        $category = Category::create([
            'company_id' => $this->company->id,
            'name' => 'Monitors',
            'slug' => 'monitors',
            'image' => $storedPath,
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/categories/{$category->id}", [
                'name' => 'Monitors & Displays',
                'description' => 'Updated Description',
            ]);

        $response->assertStatus(200);
        $category->refresh();
        $this->assertEquals('Monitors & Displays', $category->name);
        $this->assertEquals($storedPath, $category->image);
        $this->assertTrue(Storage::disk('public')->exists($storedPath));
    }

    public function test_updating_category_with_remove_image_deletes_image(): void
    {
        $file = UploadedFile::fake()->image('category_to_delete.png', 400, 400);
        $storedPath = $file->store('categories', 'public');

        $category = Category::create([
            'company_id' => $this->company->id,
            'name' => 'Smartwatches',
            'slug' => 'smartwatches',
            'image' => $storedPath,
            'is_active' => true,
        ]);

        $this->assertTrue(Storage::disk('public')->exists($storedPath));

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/categories/{$category->id}", [
                'name' => 'Smartwatches Pro',
                'remove_image' => true,
            ]);

        $response->assertStatus(200);
        $category->refresh();
        $this->assertEquals('Smartwatches Pro', $category->name);
        $this->assertNull($category->image);
        $this->assertFalse(Storage::disk('public')->exists($storedPath));
    }

    public function test_updating_category_with_empty_image_string_deletes_image(): void
    {
        $file = UploadedFile::fake()->image('category_empty.png', 400, 400);
        $storedPath = $file->store('categories', 'public');

        $category = Category::create([
            'company_id' => $this->company->id,
            'name' => 'Audio & Speakers',
            'slug' => 'audio-speakers',
            'image' => $storedPath,
            'is_active' => true,
        ]);

        $this->assertTrue(Storage::disk('public')->exists($storedPath));

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/categories/{$category->id}", [
                'name' => 'Audio & Speakers',
                'image' => '',
            ]);

        $response->assertStatus(200);
        $category->refresh();
        $this->assertNull($category->image);
        $this->assertFalse(Storage::disk('public')->exists($storedPath));
    }

    public function test_updating_category_replaces_image_with_new_file(): void
    {
        $oldFile = UploadedFile::fake()->image('old_category.png', 400, 400);
        $oldPath = $oldFile->store('categories', 'public');

        $category = Category::create([
            'company_id' => $this->company->id,
            'name' => 'Cameras',
            'slug' => 'cameras',
            'image' => $oldPath,
            'is_active' => true,
        ]);

        $newFile = UploadedFile::fake()->image('new_category.png', 400, 400);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/categories/{$category->id}", [
                'name' => 'Cameras & Lenses',
                'image_file' => $newFile,
            ]);

        $response->assertStatus(200);
        $category->refresh();
        $this->assertEquals('Cameras & Lenses', $category->name);
        $this->assertNotEquals($oldPath, $category->image);
        $this->assertNotNull($category->image);
        $this->assertFalse(Storage::disk('public')->exists($oldPath));
        $this->assertTrue(Storage::disk('public')->exists($category->image));
    }
}
