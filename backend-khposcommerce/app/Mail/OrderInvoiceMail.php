<?php

namespace App\Mail;

use App\Models\Order\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice for Order #' . ($this->order->order_number ?? $this->order->id),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.invoice',
            with: ['order' => $this->order],
        );
    }
}
