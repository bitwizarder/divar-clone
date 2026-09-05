<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\Attributes\Sluggable;


#[Sluggable(from: 'title', to: 'slug')]
class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id', 'slug'];
}
