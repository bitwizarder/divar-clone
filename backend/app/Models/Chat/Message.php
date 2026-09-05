<?php

namespace App\Models\Chat;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'read_at',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(
            Conversation::class
        );
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'sender_id'
        );
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(
            Attachment::class
        );
    }
}
