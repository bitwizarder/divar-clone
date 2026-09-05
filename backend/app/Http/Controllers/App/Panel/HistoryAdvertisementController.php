<?php

namespace App\Http\Controllers\App\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\AdvertisementResource;
use App\Models\Advertise\Advertisement;
use App\Traits\HttpResponses;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class HistoryAdvertisementController extends Controller
{
    use HttpResponses, AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $history = auth()->user()->viewedAdvertisements()->with('category', 'city')->latest('pivot_updated_at')->get();
        return $this->success('لیست تاریخچه بازدید دریافت شد', 200, AdvertisementResource::collection($history));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Advertisement $advertisement)
    {
        $user = auth()->user();
        if (!$user) {
            return; // یا return response()->json(['message' => 'Unauthenticated'], 401);
        }
        if ($user->viewedAdvertisements()->where('advertisement_id', $advertisement->id)->exists()) {
            $user->viewedAdvertisements()->updateExistingPivot($advertisement->id, ['updated_at' => now()]);
        } else {
            $user->viewedAdvertisements()->attach($advertisement->id);
            return $this->success('آگهی با موفقیت به تاریخچه بازدید اضافه شد');
        }
        return $this->success('لیست تاریخچه بازدید بروز شد');
    }
}
