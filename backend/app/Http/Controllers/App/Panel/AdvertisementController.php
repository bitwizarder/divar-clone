<?php

namespace App\Http\Controllers\App\panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\StoreAdvertisementRequest;
use App\Http\Requests\App\UpdateAdvertisementRequest;
use App\Http\Resources\App\Advertise\AdvertisementCollection;
use App\Http\Resources\App\Home\AdvertisementCollection as HomeAdvertisementCollection;
use App\Http\Resources\App\Home\AdvertisementResource;
use App\Http\Services\Image\ImageService;
use App\Models\Advertise\Advertisement;
use App\Models\User;
use App\Traits\HttpResponses;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    use HttpResponses, AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
  
        return new HomeAdvertisementCollection(auth()->user()->advertisements);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAdvertisementRequest $request, ImageService $imageservice)
    {

        $inputs = [
            'title' => $request->title,
            'description' => $request->description,
            'ads_status' => $request->ads_status,
            'ads_type' => $request->ads_type,
            'category_id' => $request->category_id,
            'city_id' => $request->city_id,
            'state_id' => $request->state_id,
            'contact' => $request->contact,
            'image' => $request->image,
            'price' => $request->price,
            'tags' => $request->tags,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'willing_to_trade' => $request->willing_to_trade ?? 0,
            'user_id' => auth()->user()->id,
            'status' => 3,
        ];

        if ($request->hasFile('image')) {
            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'user-advertisement-images');
            $result = $imageservice->createIndexAndSave($request->image);
            if ($result) {
                $inputs['image'] = $result;
            } else {
                return $this->error('آپلود عکس ناموفق بود.', 500);
            }
        }


        $advertisement = Advertisement::create($inputs);


        // ========== ذخیره مقادیر ویژگی‌ها ==========
        if ($request->filled('category_value_ids')) {
            $ids = $request->input('category_value_ids');
            if (is_array($ids) && count($ids) > 0) {
                $advertisement->categoryValues()->sync($ids);
            }
        }
        // if ($request->has('category_values') && is_array($request->category_values)) {
        //             $advertisement->categoryValues()->attach($request->category_values);
        //         }


        return new AdvertisementResource($advertisement);
    }



    /**
     * Display the specified resource.
     */
    public function show(Advertisement $advertisement)
    {
        $this->authorize('view', $advertisement);
        $advertisement->load(['category.allParents', 'city', 'state', 'images', 'category.attributes', 'categoryValues']);

        return new AdvertisementResource($advertisement);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdvertisementRequest $request, Advertisement $advertisement, ImageService $imageservice)
    {
        $this->authorize('update', $advertisement);

        $inputs = [
            'title' => $request->title,
            'description' => $request->description,
            'ads_status' => $request->ads_status,
            'ads_type' => $request->ads_type,
            'category_id' => $request->category_id,

            'city_id' => $request->city_id,
            'state_id' => $request->state_id,

            'contact' => $request->contact,
            'image' => $request->image,
            'price' => $request->price,
            'tags' => $request->tags,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'willing_to_trade' => $request->willing_to_trade ?? 0,
            'status' => 3,
        ];

        // ۱. اگر فایل جدید آپلود شده باشد
        if ($request->hasFile('image')) {
            // حذف تصویر قدیمی
            if (!empty($advertisement->image) && isset($advertisement->image['directory'])) {
                $imageservice->deleteDirectoryAndFiles($advertisement->image['directory']);
            }

            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'user-advertisement-images');
            $result = $imageservice->createIndexAndSave($request->file('image'));

            if ($result) {
                $inputs['image'] = $result;
            } else {
                return $this->error('آپلود عکس ناموفق بود.', 500);
            }
        }
        // ۲. اگر کاربر درخواست حذف تصویر دارد
        else if ($request->has('remove_image') && filter_var($request->input('remove_image'), FILTER_VALIDATE_BOOLEAN)) {
            if (!empty($advertisement->image) && isset($advertisement->image['directory'])) {
                $imageservice->deleteDirectoryAndFiles($advertisement->image['directory']);
            }
            $inputs['image'] = null;
        }
        // ۳. در غیر این صورت، تصویر قبلی را حفظ کن (تغییری نده)
        else {
            // $inputs['image'] را حذف می‌کنیم تا تغییری در دیتابیس ایجاد نشود
            unset($inputs['image']);
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
        $this->authorize('delete', $advertisement);

        $advertisement->delete();
        return $this->success('آگهی با موفقیت حذف شد.');
    }
}
