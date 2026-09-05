<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\CategoryCollection;
use App\Models\Advertise\Category;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new CategoryCollection(Category::whereNull('parent_id')->with('children')->get());
    }
    public function allCategories()
    {
        return new CategoryCollection(Category::with('parent')->get());
    }
}
