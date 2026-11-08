<?php

namespace App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $table = 'notification_templates';

    protected $fillable = [
        'code',
        'name',
        'title_template',
        'message_template',
        'icon',
        'color',
        'type',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Format title template using dynamic variables e.g. {code}, {name}
     */
    public function renderTitle(array $data = []): string
    {
        $title = $this->title_template;
        foreach ($data as $key => $value) {
            if (is_scalar($value)) {
                $title = str_replace('{' . $key . '}', (string) $value, $title);
            }
        }
        return $title;
    }

    /**
     * Format message template using dynamic variables e.g. {code}, {amount}
     */
    public function renderMessage(array $data = []): string
    {
        $message = $this->message_template;
        foreach ($data as $key => $value) {
            if (is_scalar($value)) {
                $message = str_replace('{' . $key . '}', (string) $value, $message);
            }
        }
        return $message;
    }
}
