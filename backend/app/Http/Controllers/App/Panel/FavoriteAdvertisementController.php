<?php

namespace App\Http\Controllers\App\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\AdvertisementResource;
use App\Models\Advertise\Advertisement;
use App\Traits\HttpResponses;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class FavoriteAdvertisementController extends Controller
{
    use HttpResponses, AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $favorite = auth()->user()->favoriteAdvertisements()->with('category', 'city')->get();
        return $this->success('لیست آگهی های نشان شده شما دریافت شد', 200, AdvertisementResource::collection($favorite));
        // return $this->success('لیست آگهی های نشان شده شما دریافت شد', 200, new AdvertisementCollection($favorite));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Advertisement $advertisement)
    {
        $user = auth()->user();
        if ($user->favoriteAdvertisements()->where('advertisement_id', $advertisement->id)->exists()) {
            return $this->error('این آگهی قبلا نشان شده است', 400);
        }
        $user->favoriteAdvertisements()->attach($advertisement->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Advertisement $advertisement)
    {
        $user = auth()->user();
        if (!$user->favoriteAdvertisements()->where('advertisement_id', $advertisement->id)->exists()) {
            return $this->error('این آگهی در لیست نشان شده ها نیست', 400);
        }
        $user->favoriteAdvertisements()->detach($advertisement);
        return $this->success('آگهی با موفقیت از لیست نشان شده ها حذف شد');
    }
}
