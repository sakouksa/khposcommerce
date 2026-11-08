<?php

namespace App\Http\Resources;

use App\Http\Resources\BaseJsonResource;

class ApiResource extends BaseJsonResource
{
    protected string $message;

    public function __construct($resource, string $message = 'Success')
    {
        parent::__construct($resource);
        $this->message = $message;
    }

    public function with($request): array
    {
        return [
            'message' => $this->message,
        ];
    }
}
