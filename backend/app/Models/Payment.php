<?php

namespace App\Models;

use App\Models\Advertise\Advertisement;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'gateway_response' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }
}
