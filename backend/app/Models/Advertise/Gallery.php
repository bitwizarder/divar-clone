<?php

namespace App\Models\Advertise;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Guarded(['id'])]

class Gallery extends Model
{
    use HasFactory, SoftDeletes;
    protected $casts = [
        'image' => 'array',
    ];
    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }
}
