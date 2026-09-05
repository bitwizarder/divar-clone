<?php

namespace App\Models\Advertise;


use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\Attributes\Sluggable;

#[Guarded(['id'])]
class CategoryAttribute extends Model
{
    use HasFactory, SoftDeletes;



    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function categoryValues()
    {
        return $this->hasMany(CategoryValue::class);
    }

    public function values()
    {
        return $this->hasMany(CategoryValue::class);
    }
}
