<?php

namespace App\Models\Chat;

use App\Models\Advertise\Advertisement;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'advertisement_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function advertisement(): BelongsTo
    {
        return $this->belongsTo(Advertisement::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'participants'
        )->withPivot([
            'last_read_at',
        ])->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage(): HasOne
    {
        return $this->hasOne(Message::class)
            ->latestOfMany('sent_at');
    }
}
