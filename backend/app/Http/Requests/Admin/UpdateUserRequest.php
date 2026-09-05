<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // دریافت کاربر از مسیر (Route Model Binding)
        $user = $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                // ✅ اضافه کردن ignore برای کاربر فعلی
                Rule::unique('users')->whereNull('deleted_at')->ignore($user->id),
            ],
            'mobile' => [
                'nullable',
                'string',
                'digits:11',
                // ✅ اضافه کردن ignore برای کاربر فعلی
                Rule::unique('users')->whereNull('deleted_at')->ignore($user->id),
            ],
            // ✅ password را nullable کن تا در صورت عدم ارسال، اعتبارسنجی نشود
            'password' => [
                'nullable',
                'string',
                'confirmed',
                Rules\Password::defaults(),
            ],
            'is_active' => 'required|boolean',
            'city_id' => 'nullable|exists:cities,id',
        ];
    }

    /**
     * پیام‌های خطای سفارشی
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'این ایمیل قبلاً ثبت شده است.',
            'mobile.unique' => 'این شماره موبایل قبلاً ثبت شده است.',
            'password.confirmed' => 'رمز عبور و تکرار آن مطابقت ندارند.',
        ];
    }
}
