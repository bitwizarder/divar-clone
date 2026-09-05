<?php

namespace App\Http\Controllers\Chat;

use App\Events\Chat\MessageSent;
use App\Events\Chat\MessagesRead;
use App\Http\Controllers\Controller;
use App\Models\Advertise\Advertisement;
use App\Models\Chat\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ChatController extends Controller
{
    use AuthorizesRequests;

    public function conversations()
    {
        $userId = auth()->id();

        $conversations = auth()->user()->conversations()
            ->with([
                'participants' => fn($q) => $q
                    ->where('users.id', '!=', $userId)
                    ->select('users.id', 'users.name', 'users.mobile'),
                'lastMessage',
                'advertisement',
            ])
            ->withCount([
                'messages as unread_count' => fn($q) => $q
                    ->where('sender_id', '!=', $userId)
                    ->where(
                        fn($q) => $q
                            ->whereNull('messages.read_at')
                            ->orWhereColumn(
                                'messages.sent_at',
                                '>',
                                'participants.last_read_at'
                            )
                    ),
            ])
            ->latest('last_message_at')
            ->get();

        return response()->json($conversations);
    }

    public function show(Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $conversation->load([
            'participants' => fn($q) => $q
                ->where('user_id', '!=', auth()->id())
                ->select('users.id', 'users.name', 'users.mobile'),
            'advertisement',
        ]);

        $messages = $conversation->messages()
            ->with(['sender:id,name,mobile', 'attachments'])
            ->orderBy('sent_at')
            ->get();

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorize('send', $conversation);

        $request->validate([
            'body' => 'required_without:attachment|string|max:5000',
            'attachment' => 'nullable|file|max:2048|mimes:jpg,jpeg,png,gif,webp,mp4,pdf,doc,docx',
        ]);

        // حذف تگ‌های HTML
        // $request->merge([
        //     'body' => strip_tags($request->body),
        // ]);
        // تبدیل کاراکترهای خاص
        //         $request->merge([
        //     'body' => htmlspecialchars($request->body, ENT_QUOTES, 'UTF-8'),
        // ]);

        $message = DB::transaction(function () use ($request, $conversation) {
            $message = $conversation->messages()->create([
                'sender_id' => auth()->id(),
                'body' => $request->body,
                'sent_at' => now(),
            ]);

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $path = $file->store('chat-attachments', 'public');

                $message->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }

            $conversation->update(['last_message_at' => now()]);

            $conversation->participants()
                ->where('user_id', auth()->id())
                ->update(['last_read_at' => now()]);

            return $message->load([
                'sender:id,name,mobile',
                'attachments',
                'conversation',
            ]);
        });

        event(new MessageSent($message));

        return response()->json($message, 201);
    }

    public function markAsRead(Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->participants()
            ->where('user_id', auth()->id())
            ->update(['last_read_at' => now()]);

        broadcast(new MessagesRead($conversation, auth()->id()));

        return response()->json(['message' => 'marked as read']);
    }

    public function startConversation(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
        ]);

        $ad = Advertisement::with('user')
            ->findOrFail($request->advertisement_id);
        $buyer = auth()->user();
        $seller = $ad->user;

        if ($buyer->id === $seller->id) {
            return response()->json([
                'message' => 'نمی‌توانید با خودتان چت کنید',
            ], 400);
        }

        $conversation = Conversation::where('advertisement_id', $ad->id)
            ->whereHas('participants', fn($q) => $q->where('user_id', $buyer->id))
            ->whereHas('participants', fn($q) => $q->where('user_id', $seller->id))
            ->first();

        if (!$conversation) {
            $conversation = DB::transaction(function () use ($ad, $buyer, $seller) {
                $conversation = Conversation::create([
                    'advertisement_id' => $ad->id,
                    'last_message_at' => now(),
                ]);

                $conversation->participants()->attach([
                    $buyer->id => ['last_read_at' => now()],
                    $seller->id => ['last_read_at' => now()],
                ]);

                return $conversation;
            });
        }

        return response()->json($conversation);
    }
}
