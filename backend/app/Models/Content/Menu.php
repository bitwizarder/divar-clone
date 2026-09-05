<?php

namespace App\Models\Content;

use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\Attributes\Sluggable;

#[Sluggable(from: 'title', to: 'slug')]
class Menu extends Model
{
    use HasFactory, SoftDeletes, CascadeSoftDeletes;

    protected $guarded = ['id'];
    protected $cascadeDeletes = ['children'];

    public function children()
    {
        return $this->hasMany($this, 'parent_id');
    }
    public function parent()
    {
        return $this->belongsTo($this, 'parent_id');
    }
}
