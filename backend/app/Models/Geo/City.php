<?php

namespace App\Models\Geo;

use App\Models\Advertise\Advertisement;
use App\Models\Advertise\State;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }

    public function scopeActive(Builder $query)
    {
        $query->where('status', 1);
    }

    public function states()
    {
        return $this->hasMany(State::class);
    }
}
