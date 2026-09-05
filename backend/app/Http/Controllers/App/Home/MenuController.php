<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\MenuCollection;
use App\Models\Content\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new MenuCollection(menu::whereNull('parent_id')->get());
        return new MenuCollection(Menu::with('children')->whereNull('parent_id')->get());
    }
}
