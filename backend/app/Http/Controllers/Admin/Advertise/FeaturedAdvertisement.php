<?php

namespace App\Models\Advertise;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FeaturedAdvertisement extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
 
    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payment()
    {
        return $this->belongsTo(\App\Models\Payment::class);
    }
}
