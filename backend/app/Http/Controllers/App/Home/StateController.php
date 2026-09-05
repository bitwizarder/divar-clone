<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\StateCollection;
use App\Models\Advertise\State;
use App\Traits\HttpResponses;

class StateController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new StateCollection(State::whereNull('parent_id')->with(['children', 'parent', 'city'])->get());
    }
}
