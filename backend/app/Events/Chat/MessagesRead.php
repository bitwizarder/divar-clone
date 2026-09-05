<?php

namespace App\Events\Chat;

use App\Models\Chat\Conversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessagesRead implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public Conversation $conversation,
        public int $readerId
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            /*
             * برای ChatWindow طرف مقابل
             */
            new PrivateChannel(
                'conversation.' . $this->conversation->id
            ),
        ];

        /*
         * پیدا کردن کاربر مقابل
         */
        $other = $this->conversation
            ->participants()
            ->where('user_id', '!=', $this->readerId)
            ->first();

        /*
         * notification/read event برای کاربر مقابل
         */
        if ($other) {
            $channels[] = new PrivateChannel(
                'user.' . $other->id
            );
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'messages.read';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversation->id,
            'read_at' => now()->toISOString(),
            'reader_id' => $this->readerId,
        ];
    }
}
