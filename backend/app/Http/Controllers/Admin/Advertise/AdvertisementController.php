<?php

namespace App\Http\Controllers\Admin\Advertise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Advertise\StoreAdvertisementRequest;
use App\Http\Requests\Admin\Advertise\UpdateAdvertisementRequest;
use App\Http\Resources\Admin\Advertise\AdvertisementCollection;
use App\Http\Resources\Admin\Advertise\AdvertisementResource;
use App\Http\Services\Image\ImageService;
use App\Models\Advertise\Advertisement;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdvertisementController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new AdvertisementCollection(Advertisement::all());
        $advertisements = Advertisement::with(['category', 'user', 'city', 'state', 'featuredAdvertisement'])->get();
        $advertisementCount = Advertisement::count();
        $trashCount = Advertisement::onlyTrashed()->count();
        return new AdvertisementCollection($advertisements, $advertisementCount, $trashCount);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAdvertisementRequest $request, ImageService $imageservice)
    {
        $inputs = $request->all();

        if ($request->hasFile('image')) {
            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'advertisement-images');
            $result = $imageservice->createIndexAndSave($request->image);
            if ($result) {
                $inputs['image'] = $result;
            } else {
                return $this->error('آپلود عکس ناموفق بود.', 500);
            }
        }

        // ========== مدیریت خودکار تاریخ‌ها ==========
        if (empty($inputs['published_at']) || $inputs['published_at'] === null) {
            $inputs['published_at'] = now();
        } else {
            // تبدیل رشته ISO به فرمت MySQL
            $inputs['published_at'] = Carbon::parse($inputs['published_at'])->format('Y-m-d H:i:s');
        }

        if (empty($inputs['expired_at']) || $inputs['expired_at'] === null) {
            $inputs['expired_at'] = now()->addMonth();
        } else {
            $inputs['expired_at'] = Carbon::parse($inputs['expired_at'])->format('Y-m-d H:i:s');
        }

        $advertisement = Advertisement::create($inputs);

        // ========== ذخیره مقادیر ویژگی‌ها ==========
        if ($request->filled('category_value_ids')) {
            $ids = $request->input('category_value_ids');
            if (is_array($ids) && count($ids) > 0) {
                $advertisement->categoryValues()->sync($ids);
            }
        }
        return new AdvertisementResource($advertisement);
    }
    /**
     * Display the specified resource.
     */
    public function show(Advertisement $advertisement)
    {
        $advertisement->load(['category', 'category.allParents', 'city', 'state', "user", 'images', 'category.attributes', 'categoryValues', 'featuredAdvertisement']);

        return new AdvertisementResource($advertisement);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdvertisementRequest $request, Advertisement $advertisement, ImageService $imageservice)
    {
        // dd($request->all());
        $inputs = $request->except(['_method', 'image', 'currentImage']); // فقط فیلدهای متنی

        // ========== مدیریت تصویر ==========
        // ۱. اگر فایل جدید آپلود شده باشد
        if ($request->hasFile('image')) {
            // حذف تصویر قدیمی
            if (!empty($advertisement->image) && isset($advertisement->image['directory'])) {
                $imageservice->deleteDirectoryAndFiles($advertisement->image['directory']);
            }

            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'advertisement-images');
            $result = $imageservice->createIndexAndSave($request->file('image'));

            if ($result) {
                $inputs['image'] = $result;
            } else {
                return $this->error('آپلود عکس ناموفق بود.', 500);
            }
        } else {
            // ۲. اگر فایل جدیدی نیامده، اما کاربر درخواست حذف تصویر دارد
            if ($request->has('remove_image') && filter_var($request->input('remove_image'), FILTER_VALIDATE_BOOLEAN)) {
                if (!empty($advertisement->image) && isset($advertisement->image['directory'])) {
                    $imageservice->deleteDirectoryAndFiles($advertisement->image['directory']);
                }
                $inputs['image'] = null;
            } else {
                // ۳. در غیر این صورت، تصویر قبلی را حفظ کن
                if (!empty($advertisement->image)) {
                    $inputs['image'] = $advertisement->image;
                }
            }
        }

        // ========== مدیریت تاریخ‌ها ==========
        if ($request->has('published_at')) {
            $publishedAt = $request->input('published_at');
            if ($publishedAt === '' || $publishedAt === null) {
                $inputs['published_at'] = now(); // پیش‌فرض جدید
            } else {
                $inputs['published_at'] = Carbon::parse($publishedAt)->format('Y-m-d H:i:s');
            }
        } else {
            unset($inputs['published_at']); // تغییر نکرده، مقدار قبلی حفظ می‌شود
        }

        if ($request->has('expired_at')) {
            $expiredAt = $request->input('expired_at');
            if ($expiredAt === '' || $expiredAt === null) {
                $inputs['expired_at'] = $inputs['published_at'] ? Carbon::parse($publishedAt)->addMonth() : now()->addMonth();
            } else {
                $inputs['expired_at'] = Carbon::parse($expiredAt)->format('Y-m-d H:i:s');
            }
        } else {
            unset($inputs['expired_at']);
        }

        $advertisement->update($inputs);

        // ========== ذخیره مقادیر ویژگی‌ها ==========
        if ($request->filled('category_value_ids')) {
            $ids = $request->input('category_value_ids');
            if (is_array($ids) && count($ids) > 0) {
                $advertisement->categoryValues()->sync($ids);
            }
        }
        return new AdvertisementResource($advertisement);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Advertisement $advertisement)
    {
        $advertisement->delete();
        return $this->success('آگهی با موفقیت حذف شد.');
    }
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:advertisements,id',
            ],
        ]);

        Advertisement::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            ' آگهیان انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed advertisements.
     */
    public function trash()
    {
        return new  AdvertisementCollection(
            Advertisement::onlyTrashed()
                ->with(['category', 'user', 'city'])
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed state.
     */
    public function restore(int $id)
    {
        $advertisement =  Advertisement::onlyTrashed()
            ->findOrFail($id);

        $advertisement->restore();

        return $this->success(
            'آگهی با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed state.
     */
    public function forceDestroy(int $id)
    {
        $advertisement =  Advertisement::onlyTrashed()
            ->findOrFail($id);

        $advertisement->forceDelete();

        return $this->success(
            'آگهی به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed advertisements.
     */
    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
            ],
        ]);

        Advertisement::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            ' آگهیان انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed advertisements.
     */
    public function bulkForceDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
            ],
        ]);

        Advertisement::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            ' آگهیان انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
