<?php

namespace App\Http\Controllers\App\Home;

use App\Http\Controllers\Controller;
use App\Models\Setting\Setting;

class SettingController extends Controller
{
    public function index()
    {
        // معمولاً فقط یک رکورد در جدول settings وجود دارد
        $settings = Setting::first();
        if (!$settings) {
            // در صورت خالی بودن، مقادیر پیش‌فرض برگردان
            return response()->json([
                'title' => 'سایت من',
                'description' => 'توضیحات پیش‌فرض',
                'logo' => null,
                'favicon' => null,
                'email' => null,
                'phone' => null,
                'keywords' => null,
            ]);
        }
        return response()->json($settings);
    }
}
