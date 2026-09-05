<?php

namespace App\Models\Advertise;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Guarded(['id'])]
class CategoryValue extends Model
{
    use HasFactory, SoftDeletes;


    public function categoryAttribute()
    {
        return $this->belongsTo(CategoryAttribute::class);
    }

    public function advertisements()
    {
        return $this->belongsToMany(Advertisement::class, 'advertisement_category_values')->withTimestamps();
    }
}
