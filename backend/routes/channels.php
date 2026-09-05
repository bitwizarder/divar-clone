<?php

use App\Models\Chat\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Conversation Private Channel
|--------------------------------------------------------------------------
|
| فقط اعضای همان conversation اجازه subscribe دارند.
|
*/

Broadcast::channel(
    'conversation.{conversationId}',
    function (User $user, int $conversationId) {

        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return false;
        }

        return $conversation->participants()
            ->where('user_id', $user->id)
            ->exists();
    }
);

/*
|--------------------------------------------------------------------------
| User Private Channel
|--------------------------------------------------------------------------
|
| هر کاربر فقط به channel خودش دسترسی دارد.
|
*/

Broadcast::channel(
    'user.{userId}',
    function (User $user, int $userId) {

        return (int) $user->id === (int) $userId;
    }
);
