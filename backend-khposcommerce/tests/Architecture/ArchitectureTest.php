<?php

namespace Tests\Architecture;

use Tests\TestCase;

class ArchitectureTest extends TestCase
{
    /**
     * Test basic architecture rules and naming consistency.
     */
    public function test_actions_and_services_exist(): void
    {
        $this->assertTrue(is_dir(app_path('Actions')));
        $this->assertTrue(is_dir(app_path('Services')));
        $this->assertTrue(is_dir(app_path('Support')));
    }
}
