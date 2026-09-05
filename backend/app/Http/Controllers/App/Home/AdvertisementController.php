<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\App\Panel\HistoryAdvertisementController;
use App\Http\Controllers\Controller;
use App\Http\Resources\App\Home\AdvertisementCollection;
use App\Http\Resources\App\Home\AdvertisementResource;
use App\Models\Advertise\Advertisement;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    use HttpResponses;


    /**
     * Display a listing of the resource with filters.
     */
    public function index(Request $request)
    {
        $query = Advertisement::with(['category', 'city', 'state', 'featuredAdvertisement']);

        // ========== فیلتر بر اساس دسته‌بندی (شامل زیرمجموعه‌ها) ==========
        if ($request->has('category_id') && $request->filled('category_id')) {
            $categoryIds = $this->getCategoryIdsWithChildren($request->category_id);
            $query->whereIn('category_id', $categoryIds);
        }

        // ========== فیلتر بر اساس محله (state) (شامل زیرمجموعه‌ها) ==========
        if ($request->has('state_id') && $request->filled('state_id')) {
            $stateIds = $this->getStateIdsWithChildren($request->state_id);
            $query->whereIn('state_id', $stateIds);
        }

        // ========== فیلتر شهر (دقیق) ==========
        if ($request->has('city_id') && $request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }
        // ========== فیلتر بر اساس چند شهر ==========
        if ($request->has('city_ids') && is_array($request->city_ids)) {
            $cityIds = array_filter($request->city_ids, fn($id) => !empty($id));
            if (!empty($cityIds)) {
                $query->whereIn('city_id', $cityIds);
            }
        }

        // ========== فیلتر قیمت (از و تا) ==========
        if ($request->has('price_min') && $request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }
        if ($request->has('price_max') && $request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        // ========== فیلتر عکس دار ==========
        if ($request->has('has_image') && $request->filled('has_image')) {
            $query->whereNotNull('image');
        }

        // ========== فیلتر فوری (ویژه یا نردبانی) ==========
        if ($request->has('is_urgent') && $request->filled('is_urgent')) {
            $query->where(function ($q) {
                $q->where('is_special', 1)->orWhere('is_ladder', 1);
            });
        }

        // ========== جستجوی متن ==========
        if ($request->has('search') && $request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('tags', 'LIKE', "%{$search}%");
            });
        }
        $query->where("status", 1);
        $query->orderBy('created_at', 'desc');


        // $advertisements = $query->get();

        // تعداد آیتم در هر صفحه (پیش‌فرض ۱۲)
        $perPage = $request->input('per_page', 12);
        $page = $request->input('page', 1);

        // استفاده از paginate به‌جای get
        $advertisements = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' =>  AdvertisementResource::collection($advertisements),
            'current_page' => $advertisements->currentPage(),
            'last_page' => $advertisements->lastPage(),
            'per_page' => $advertisements->perPage(),
            'total' => $advertisements->total(),
            'status' => true,
        ]);
        // return new AdvertisementCollection($advertisements);
    }
    public function show(Advertisement $advertisement)
    {
        $advertisement->increment('view');

        if (auth()->check()) {
            $historyController = new HistoryAdvertisementController();
            $historyController->store($advertisement);
        }

        $advertisement = Advertisement::with(['category.allParents', 'city', 'state', 'images', 'category.attributes', 'categoryValues', 'featuredAdvertisement'])->find($advertisement->id);
        return new AdvertisementResource($advertisement);
    }


    // داخل کلاس AdvertisementController

    /**
     * دریافت شناسه‌های یک دسته به همراه تمام فرزندان آن (به‌صورت بازگشتی)
     */
    private function getCategoryIdsWithChildren($categoryId)
    {
        $ids = [$categoryId];
        $category = \App\Models\Advertise\Category::find($categoryId);
        if ($category) {
            $childrenIds = $category->children()->pluck('id')->toArray();
            foreach ($childrenIds as $childId) {
                $ids = array_merge($ids, $this->getCategoryIdsWithChildren($childId));
            }
        }
        return $ids;
    }

    /**
     * دریافت شناسه‌های یک محله (state) به همراه تمام فرزندان آن (به‌صورت بازگشتی)
     */
    private function getStateIdsWithChildren($stateId)
    {
        $ids = [$stateId];
        $state = \App\Models\Advertise\State::find($stateId);
        if ($state) {
            $childrenIds = $state->children()->pluck('id')->toArray();
            foreach ($childrenIds as $childId) {
                $ids = array_merge($ids, $this->getStateIdsWithChildren($childId));
            }
        }
        return $ids;
    }
}
