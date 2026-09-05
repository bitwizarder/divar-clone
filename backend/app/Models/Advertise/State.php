<?php

namespace App\Models\Advertise;

use App\Models\Geo\City;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Guarded(['id'])]

class State extends Model
{
    use HasFactory, SoftDeletes, CascadeSoftDeletes;

    protected $cascadeDeletes = ['children'];


    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
    public function children()
    {
        return $this->hasMany($this, 'parent_id');
    }
    public function parent()
    {
        return $this->belongsTo($this, 'parent_id');
    }

    public function city()
{
    return $this->belongsTo(City::class);
}
}
