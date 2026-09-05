<?php

namespace App\Events\Chat;

use App\Models\Chat\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public Message $message
    ) {
        $this->message->load([
            'sender:id,name,mobile',
            'attachments',
            'conversation',
        ]);
    }

    /**
     * کانال‌هایی که event روی آن‌ها broadcast می‌شود.
     */
    public function broadcastOn(): array
    {
        $channels = [

            /*
             * برای ChatWindow
             */
            new PrivateChannel(
                'conversation.' . $this->message->conversation_id
            ),
        ];

        /*
         * پیدا کردن گیرنده پیام
         */
        $recipient = $this->message
            ->conversation
            ->participants()
            ->where('user_id', '!=', $this->message->sender_id)
            ->first();

        /*
         * برای ChatList
         */
        if ($recipient) {
            $channels[] = new PrivateChannel(
                'user.' . $recipient->id
            );
        }

        return $channels;
    }

    /**
     * نام event در Echo
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * داده‌ای که به Frontend ارسال می‌شود.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_id' => $this->message->sender_id,
                'body' => $this->message->body,
                'sent_at' => $this->message->sent_at,
                'sender' => $this->message->sender,
                'attachments' => $this->message->attachments,
            ],
        ];
    }
}
