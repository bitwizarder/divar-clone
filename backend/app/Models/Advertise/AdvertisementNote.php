<?php

namespace App\Models\Advertise;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Guarded(['id'])]
class AdvertisementNote extends Model
{
    use HasFactory, SoftDeletes;
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function advertisements()
    {
        return $this->belongsTo(Advertisement::class);
    }
}
