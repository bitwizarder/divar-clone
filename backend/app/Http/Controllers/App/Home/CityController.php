<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\CityCollection;
use App\Models\Geo\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new CityCollection(City::active()->with(['states'])->get());
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }
}
