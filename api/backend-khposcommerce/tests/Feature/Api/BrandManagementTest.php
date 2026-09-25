<?php

namespace Tests\Feature\Api;

use App\Models\Company\Company;
use App\Models\Product\Brand;
use App\Models\User;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BrandManagementTest extends TestCase
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

    public function test_can_list_brands(): void
    {
        Brand::create([
            'company_id' => $this->company->id,
            'name' => 'Apple',
            'slug' => 'apple',
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/brands');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
        ]);
    }

    public function test_can_create_brand_with_logo_file(): void
    {
        $file = UploadedFile::fake()->image('brand_logo.png', 200, 200);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/brands', [
                'company_id' => $this->company->id,
                'name' => 'Sony',
                'description' => 'Sony Electronics',
                'logo_file' => $file,
                'is_active' => true,
            ]);

        $response->assertStatus(201);
        $data = $response->json('data');
        $this->assertNotNull($data['logo']);
        $this->assertTrue(Storage::disk('public')->exists($data['logo']));
    }

    public function test_updating_brand_details_preserves_existing_logo(): void
    {
        $file = UploadedFile::fake()->image('old_logo.png', 200, 200);
        $storedPath = $file->store('brands', 'public');

        $brand = Brand::create([
            'company_id' => $this->company->id,
            'name' => 'Samsung',
            'slug' => 'samsung',
            'logo' => $storedPath,
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/brands/{$brand->id}", [
                'name' => 'Samsung Electronics',
                'description' => 'Updated Description',
            ]);

        $response->assertStatus(200);
        $brand->refresh();
        $this->assertEquals('Samsung Electronics', $brand->name);
        $this->assertEquals($storedPath, $brand->logo);
        $this->assertTrue(Storage::disk('public')->exists($storedPath));
    }

    public function test_updating_brand_with_remove_logo_deletes_image(): void
    {
        $file = UploadedFile::fake()->image('brand_to_delete.png', 200, 200);
        $storedPath = $file->store('brands', 'public');

        $brand = Brand::create([
            'company_id' => $this->company->id,
            'name' => 'LG',
            'slug' => 'lg',
            'logo' => $storedPath,
            'is_active' => true,
        ]);

        $this->assertTrue(Storage::disk('public')->exists($storedPath));

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/brands/{$brand->id}", [
                'name' => 'LG Corp',
                'remove_logo' => true,
            ]);

        $response->assertStatus(200);
        $brand->refresh();
        $this->assertEquals('LG Corp', $brand->name);
        $this->assertNull($brand->logo);
        $this->assertFalse(Storage::disk('public')->exists($storedPath));
    }

    public function test_updating_brand_with_empty_logo_string_deletes_image(): void
    {
        $file = UploadedFile::fake()->image('brand_empty.png', 200, 200);
        $storedPath = $file->store('brands', 'public');

        $brand = Brand::create([
            'company_id' => $this->company->id,
            'name' => 'Panasonic',
            'slug' => 'panasonic',
            'logo' => $storedPath,
            'is_active' => true,
        ]);

        $this->assertTrue(Storage::disk('public')->exists($storedPath));

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/brands/{$brand->id}", [
                'name' => 'Panasonic',
                'logo' => '',
            ]);

        $response->assertStatus(200);
        $brand->refresh();
        $this->assertNull($brand->logo);
        $this->assertFalse(Storage::disk('public')->exists($storedPath));
    }

    public function test_updating_brand_replaces_logo_with_new_file(): void
    {
        $oldFile = UploadedFile::fake()->image('old_logo.png', 200, 200);
        $oldPath = $oldFile->store('brands', 'public');

        $brand = Brand::create([
            'company_id' => $this->company->id,
            'name' => 'Asus',
            'slug' => 'asus',
            'logo' => $oldPath,
            'is_active' => true,
        ]);

        $newFile = UploadedFile::fake()->image('new_logo.png', 200, 200);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/brands/{$brand->id}", [
                'name' => 'Asus ROG',
                'logo_file' => $newFile,
            ]);

        $response->assertStatus(200);
        $brand->refresh();
        $this->assertEquals('Asus ROG', $brand->name);
        $this->assertNotEquals($oldPath, $brand->logo);
        $this->assertNotNull($brand->logo);
        $this->assertFalse(Storage::disk('public')->exists($oldPath));
        $this->assertTrue(Storage::disk('public')->exists($brand->logo));
    }
}
