<?php

namespace App\Models\Chat;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attachment extends Model
{
    // use  SoftDeletes;

    protected $guarded = ['id'];
}
