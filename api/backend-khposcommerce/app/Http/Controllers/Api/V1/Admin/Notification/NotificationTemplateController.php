<?php

namespace App\Http\Controllers\Api\V1\Admin\Notification;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Notification\NotificationTemplateService;
use App\Http\Requests\Notification\StoreNotificationTemplateRequest;
use App\Http\Requests\Notification\UpdateNotificationTemplateRequest;
use App\Http\Resources\Notification\NotificationTemplateResource;
use App\Models\Notification\NotificationTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationTemplateController extends BaseApiController
{
    protected NotificationTemplateService $templateService;

    public function __construct(NotificationTemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    /**
     * GET /api/notification-templates
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', NotificationTemplate::class);

        $filters = $request->only(['search', 'type', 'is_active', 'channel']);
        $perPage = (int) $request->get('per_page', 15);

        $paginated = $this->templateService->getPaginatedTemplates($filters, $perPage);
        $collection = NotificationTemplateResource::collection($paginated);

        return $this->successResponse($collection, 'Notification templates retrieved successfully');
    }

    /**
     * GET /api/notification-templates/{id}
     */
    public function show($id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $this->authorize('view', $template);

        return $this->successResponse(new NotificationTemplateResource($template), 'Notification template retrieved successfully');
    }

    /**
     * POST /api/notification-templates
     */
    public function store(StoreNotificationTemplateRequest $request): JsonResponse
    {
        $this->authorize('create', NotificationTemplate::class);

        $template = $this->templateService->createTemplate($request->validated());
        return $this->successResponse(new NotificationTemplateResource($template), 'Notification template created successfully', 201);
    }

    /**
     * PUT /api/notification-templates/{id}
     */
    public function update(UpdateNotificationTemplateRequest $request, $id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $this->authorize('update', $template);

        $updated = $this->templateService->updateTemplate($template, $request->validated());
        return $this->successResponse(new NotificationTemplateResource($updated), 'Notification template updated successfully');
    }

    /**
     * POST /api/notification-templates/{id}/duplicate
     */
    public function duplicate($id): JsonResponse
    {
        $this->authorize('create', NotificationTemplate::class);

        $original = NotificationTemplate::findOrFail($id);
        $cloned = $original->replicate(['created_at', 'updated_at']);
        $cloned->code = $original->code . '_COPY_' . rand(100, 999);
        $cloned->name = $original->name . ' (Copy)';
        $cloned->save();

        return $this->successResponse(new NotificationTemplateResource($cloned), 'Template duplicated successfully', 201);
    }

    /**
     * PUT /api/notification-templates/{id}/toggle-status
     */
    public function toggleStatus($id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $this->authorize('update', $template);

        $template->is_active = !$template->is_active;
        $template->save();

        return $this->successResponse(new NotificationTemplateResource($template), 'Template status toggled successfully');
    }

    /**
     * DELETE /api/notification-templates/{id}
     */
    public function destroy($id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $this->authorize('delete', $template);

        $this->templateService->deleteTemplate($template);
        return $this->successResponse(null, 'Notification template deleted successfully');
    }

    /**
     * GET /api/notification-templates/export
     */
    public function export(): JsonResponse
    {
        $templates = NotificationTemplate::all();
        return response()->json([
            'version' => '1.0',
            'exported_at' => now()->toIso8601String(),
            'templates' => $templates,
        ]);
    }

    /**
     * POST /api/notification-templates/import
     */
    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'templates' => 'required|array',
            'templates.*.code' => 'required|string',
            'templates.*.name' => 'required|string',
            'templates.*.title_template' => 'required|string',
            'templates.*.message_template' => 'required|string',
            'templates.*.type' => 'nullable|string',
            'templates.*.priority' => 'nullable|string',
        ]);

        $importedCount = 0;
        foreach ($data['templates'] as $tData) {
            NotificationTemplate::updateOrCreate(
                ['code' => $tData['code']],
                [
                    'name' => $tData['name'],
                    'title_template' => $tData['title_template'],
                    'message_template' => $tData['message_template'],
                    'type' => $tData['type'] ?? 'system',
                    'priority' => $tData['priority'] ?? 'normal',
                    'is_active' => true,
                ]
            );
            $importedCount++;
        }

        return $this->successResponse(['imported_count' => $importedCount], "Successfully imported {$importedCount} template(s)");
    }
}
