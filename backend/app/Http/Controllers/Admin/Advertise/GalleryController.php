<?php

namespace App\Http\Controllers\Admin\Advertise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Advertise\StoreGalleryRequest;
use App\Http\Requests\Admin\Advertise\UpdateGalleryRequest;
use App\Http\Resources\Admin\Advertise\GalleryCollection;
use App\Http\Resources\Admin\Advertise\GalleryResource;
use App\Http\Services\Image\ImageService;
use App\Models\Advertise\Advertisement;
use App\Models\Advertise\Gallery;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index($id)
    {
        return new GalleryCollection(Gallery::with('advertisement')->where("advertisement_id", $id)->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGalleryRequest $request, ImageService $imageservice)
    {
        $inputs = $request->all();

        if ($request->hasFile('image')) {
            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'advertisement-images-gallery');
            $result = $imageservice->createIndexAndSave($request->image);
            if ($result) {
                $inputs['image'] = $result;
            } else {
                return $this->error('آپلود عکس ناموفق بود.', 500);
            }
        }
        $gallery = Gallery::create($inputs);
        return new GalleryResource($gallery);
    }

    /**
     * Display the specified resource.
     */
    public function show($advertisement_id, $id)
    {
        $gallery = Gallery::where('advertisement_id', $advertisement_id)
            ->findOrFail($id);
        return new GalleryResource($gallery);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGalleryRequest $request, $advertisement_id, $id, ImageService $imageservice)
    {
        $gallery = Gallery::where('advertisement_id', $advertisement_id)
            ->findOrFail($id);
        $inputs = $request->all();

        // سناریو ۱: فایل جدید آپلود شده است
        if ($request->hasFile('image')) {
            // حذف تصویر قدیمی اگر وجود داشته باشد
            if (!empty($gallery->image) && isset($gallery->image['directory'])) {
                $imageservice->deleteDirectoryAndFiles($gallery->image['directory']);
            }

            // ذخیره تصویر جدید
            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'advertisement-images-gallery');
            $result = $imageservice->createIndexAndSave($request->file('image'));

            if ($result) {
                $inputs['image'] = $result;
            } else {
                return $this->error('آپلود عکس ناموفق بود.', 500);
            }
        }
        // سناریو ۲: فایل جدید آپلود نشده است
        else {
            // آیا درخواست شامل currentImage است؟
            if (isset($inputs['currentImage'])) {
                // اگر تصویر قدیمی وجود دارد، currentImage را به‌روز کن
                if (!empty($gallery->image)) {
                    $image = $gallery->image;
                    $image['currentImage'] = $inputs['currentImage'];
                    $inputs['image'] = $image;
                }
            } else {
                // currentImage ارسال نشده است => کاربر قصد حذف تصویر را دارد
                if (!empty($gallery->image) && isset($gallery->image['directory'])) {
                    $imageservice->deleteDirectoryAndFiles($gallery->image['directory']);
                    // تصویر را از دیتابیس حذف کن (مقدار null)
                    $inputs['image'] = null;
                }
                // اگر تصویر وجود نداشت، کاری نکن
            }
        }

        // به‌روزرسانی آگهی
        $gallery->update($inputs);

        return new GalleryResource($gallery);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($advertisement_id, $id)
    {
        // پیدا کردن گالری با شرط advertisement_id و id
        $gallery = Gallery::where('advertisement_id', $advertisement_id)
            ->findOrFail($id);

        // حذف فایل‌های تصویر (در صورت وجود)
        if (!empty($gallery->image) && isset($gallery->image['directory'])) {
            $imageservice = app(ImageService::class);
            $imageservice->deleteDirectoryAndFiles($gallery->image['directory']);
        }

        $gallery->delete();
        return $this->success('گالری با موفقیت حذف شد.');
    }
}
