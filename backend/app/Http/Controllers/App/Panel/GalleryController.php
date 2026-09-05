<?php

namespace App\Http\Controllers\App\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\StoreGalleryRequest;
use App\Http\Requests\App\UpdateGalleryRequest;
use App\Http\Resources\App\Home\GalleryCollection;
use App\Http\Resources\App\Home\GalleryResource;
use App\Http\Services\Image\ImageService;
use App\Models\Advertise\Gallery;
use App\Traits\HttpResponses;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|static query()
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Advertise\Advertisement> $advertisements
 */
class GalleryController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index($advertisementId)
    {
        $advertisement = auth()->user()->advertisements()->find($advertisementId);
        if (!$advertisement) {
            return $this->error('آگهی مورد نظر یافت نشد یا متعلق به شما نیست', 403);
        }
        $galleries = Gallery::where('advertisement_id', $advertisementId)->get();
        return new GalleryCollection($galleries);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGalleryRequest $request, ImageService $imageService, $advertisementId)
    {
        $advertisement = auth()->user()->advertisements()->find($advertisementId);
        if (!$advertisement) {
            return $this->error('آگهی مورد نظر یافت نشد یا متعلق به شما نیست', 403);
        }

        $inputs = $request->all();
        $inputs['advertisement_id'] = $advertisementId;

        if ($request->hasFile('image')) {
            $imageService->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'advertisement-images-gallery');
            $result = $imageService->createIndexAndSave($request->image);
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
    public function show(Gallery $gallery)
    {

        if ($gallery->advertisement->user_id !== auth()->id()) {
            return $this->error('دسترسی غیر مجاز', 403);
        }
        return new GalleryResource($gallery->withoutRelations());
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGalleryRequest $request, Gallery $gallery, ImageService $imageService)
    {
        if ($gallery->advertisement->user_id !== auth()->user()->id) {
            return $this->error('دسترسی غیر مجاز', 403);
        }

        $inputs = $request->all();
        $inputs['advertisement_id'] = $gallery->advertisement_id;

        // سناریو ۱: فایل جدید آپلود شده است
        if ($request->hasFile('image')) {
            // حذف تصویر قدیمی اگر وجود داشته باشد
            if (!empty($gallery->image) && isset($gallery->image['directory'])) {
                $imageService->deleteDirectoryAndFiles($gallery->image['directory']);
            }

            // ذخیره تصویر جدید
            $imageService->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'advertisement-images-gallery');
            $result = $imageService->createIndexAndSave($request->file('image'));

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
                    $imageService->deleteDirectoryAndFiles($gallery->image['directory']);
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
    public function destroy(Gallery $gallery)
    {
        if ($gallery->advertisement->user_id !== auth()->user()->id) {
            return $this->error('دسترسی غیر مجاز', 403);
        }
        $gallery->delete();
        return $this->success('گالری با موفقیت حذف شد.');
    }
}
