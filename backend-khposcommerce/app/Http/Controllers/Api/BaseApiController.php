<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BaseApiController extends Controller
{
    use AuthorizesRequests;

    /**
     * Return a standardized success response.
     */

    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $statusCode = 200
    ): JsonResponse {
        $message = __($message);
        $paginator = null;
        $items = $data;

        if ($data instanceof LengthAwarePaginator) {
            $paginator = $data;
            $items = $data->items();
        } elseif ($data instanceof AnonymousResourceCollection && $data->resource instanceof LengthAwarePaginator) {
            $paginator = $data->resource;
            $items = $data->resolve();
        }

        if ($paginator) {
            return response()->json([
                'success'      => true,
                'message'      => $message,
                'data'         => $items,
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'links'        => method_exists($paginator, 'linkCollection') ? $paginator->linkCollection()->toArray() : [],
                'meta'         => [
                    'path'         => method_exists($paginator, 'path') ? $paginator->path() : '',
                    'total'        => $paginator->total(),
                    'per_page'     => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'from'         => $paginator->firstItem(),
                    'to'           => $paginator->lastItem(),
                ],
                'pagination'   => [
                    'total'        => $paginator->total(),
                    'per_page'     => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'from'         => $paginator->firstItem(),
                    'to'           => $paginator->lastItem(),
                ],
            ], $statusCode);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $statusCode);
    }

    /**
     * Return a standardized error response.
     */
    protected function errorResponse(
        string $message = 'Error',
        mixed $errors = null,
        int $statusCode = 400
    ): JsonResponse {
        $message = __($message);
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $statusCode);
    }

    /**
     * Return a standardized paginated response.
     */
    protected function paginatedResponse(mixed $data, string $message = 'Success'): JsonResponse
    {
        $message = __($message);
        return response()->json([
            'success'      => true,
            'message'      => $message,
            'data'         => $data->items(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
            'per_page'     => $data->perPage(),
            'total'        => $data->total(),
            'from'         => $data->firstItem(),
            'to'           => $data->lastItem(),
            'links'        => method_exists($data, 'linkCollection') ? $data->linkCollection()->toArray() : [],
            'meta'         => [
                'path'         => method_exists($data, 'path') ? $data->path() : '',
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'from'         => $data->firstItem(),
                'to'           => $data->lastItem(),
            ],
            'pagination'   => [
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'from'         => $data->firstItem(),
                'to'           => $data->lastItem(),
            ],
        ]);
    }

    /**
     * Return a standardized paginated response utilizing a Resource collection.
     */
    protected function paginatedResourceResponse(mixed $resourceCollection, mixed $paginator, string $message = 'Success'): JsonResponse
    {
        $message = __($message);
        return response()->json([
            'success'      => true,
            'message'      => $message,
            'data'         => $resourceCollection->resolve(),
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
            'from'         => $paginator->firstItem(),
            'to'           => $paginator->lastItem(),
            'links'        => method_exists($paginator, 'linkCollection') ? $paginator->linkCollection()->toArray() : [],
            'meta'         => [
                'path'         => method_exists($paginator, 'path') ? $paginator->path() : '',
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
            'pagination'   => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }
}
