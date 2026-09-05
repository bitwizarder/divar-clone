<?php

namespace App\Models\Advertise;

use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\Attributes\Sluggable;

#[Guarded(['id'])]
#[Sluggable(from: 'name', to: 'slug')]
class Category extends Model
{
    use HasFactory, SoftDeletes, CascadeSoftDeletes;

    protected $cascadeDeletes = ['children'];


    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
    public function attributes()
    {
        return $this->hasMany(CategoryAttribute::class);
    }
    public function children()
    {
        return $this->hasMany($this, 'parent_id');
    }
    public function parent()
    {
        return $this->belongsTo($this, 'parent_id');
    }

    public function allParents()
    {
        return $this->parent()->with('allParents');
    }
}
