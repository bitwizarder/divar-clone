<?php

namespace App\Models;

use App\Models\Advertise\Advertisement;
use App\Models\Advertise\AdvertisementNote;
use App\Models\Chat\Conversation;
use App\Models\Geo\City;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'email',
    'password',
    'mobile',
    'city_id',
    'is_active',
    'user_type',
    'mobile_verified_at',
    'email_verified_at'
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'mobile_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
    public function advertisementNotes()
    {
        return $this->hasMany(AdvertisementNote::class);
    }
    public function favoriteAdvertisements()
    {
        return $this->belongsToMany(Advertisement::class)->withTimestamps();
    }

    public function historyAdvertisements()
    {
        return $this->hasMany(AdvertisementNote::class);
    }
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function viewedAdvertisements()
    {
        return $this->belongsToMany(Advertisement::class, 'advertisement_view_history')->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'participants')
            ->withPivot('last_read_at')
            ->withTimestamps()
            ->orderBy('last_message_at', 'desc');
    }
}
