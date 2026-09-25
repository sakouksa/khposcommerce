<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ApiCollection extends ResourceCollection
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
