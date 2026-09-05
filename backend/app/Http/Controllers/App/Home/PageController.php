<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\PageCollection;
use App\Models\Content\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new PageCollection(Page::all());
    }
}
