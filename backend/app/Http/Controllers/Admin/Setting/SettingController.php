<?php

namespace App\Http\Controllers\Admin\Setting;

use App\Http\Controllers\Controller;
use App\Http\Services\Image\ImageService;
use App\Models\Setting\Setting;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use HttpResponses;

    /** 
     * Display a listing of the resource.
     */
    public function index()
    {
        $setting = Setting::first();
        return response()->json(['data' => $setting]);
    }
    /**
     * Update the specified resource in storage. 
     */
    public function update(Request $request, string $id, ImageService $imageService)
    {
        $setting = Setting::first();

        $validated = $request->validate([
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'logo'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'favicon'     => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,ico|max:2048',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:255',
            'keywords'    => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {

            // حذف لوگوی قبلی
            if (!empty($setting->logo)) {
                $imageService->deleteImage($setting->logo);
            }
            // ریست کردن state سرویس
            $imageService->reset();

            $imageService->setExclusiveDirectory(
                'images' . DIRECTORY_SEPARATOR . 'settings'
            );

            $result = $imageService->save(
                $request->file('logo')
            );

            if (!$result) {
                return $this->error(
                    'آپلود لوگو ناموفق بود.',
                    500
                );
            }

            $validated['logo'] = $result;
        }

        if ($request->hasFile('favicon')) {

            // حذف فاوآیکون قبلی
            if (!empty($setting->favicon)) {
                $imageService->deleteImage($setting->favicon);
            }

            // خیلی مهم: ریست کردن state
            $imageService->reset();

            $imageService->setExclusiveDirectory(
                'images' . DIRECTORY_SEPARATOR . 'settings'
            );

            $result = $imageService->save(
                $request->file('favicon')
            );

            if (!$result) {
                return $this->error(
                    'آپلود فاوآیکون ناموفق بود.',
                    500
                );
            }

            $validated['favicon'] = $result;
        }

        $setting->update($validated);
        return response()->json([
            'data' => $setting
        ]);
    }
}
