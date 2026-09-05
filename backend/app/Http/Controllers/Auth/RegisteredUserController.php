<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Services\Sms\SmsService;
use App\Mail\OtpMail;
use App\Models\User;
use App\Models\User\Otp;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    public function sendOtp(Request $request, SmsService $smsService)
    {
        $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
        ]);

        $identifier = $request->identifier;

        // تشخیص نوع شناسه (موبایل یا ایمیل)
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isMobile = preg_match('/^09[0-9]{9}$/', $identifier);

        if (!$isEmail && !$isMobile) {
            return response()->json([
                'message' => 'لطفاً یک شماره موبایل یا ایمیل معتبر وارد کنید.'
            ], 422);
        }

        $otpCode = random_int(100000, 999999);
        $token = Str::random(60);

        // پیدا کردن کاربر بر اساس موبایل یا ایمیل
        $user = null;
        if ($isMobile) {
            $user = User::where('mobile', $identifier)->first();
        } elseif ($isEmail) {
            $user = User::where('email', $identifier)->first();
        }

        // ذخیره OTP در دیتابیس
        Otp::updateOrCreate(
            ['login_id' => $identifier, 'used' => 0],
            [
                'token' => $token,
                'otp_code' => $otpCode,
                'login_id' => $identifier,
                'type' => $isEmail ? 1 : 0, // 0 = موبایل, 1 = ایمیل
                'attempts' => 0,
                'user_id' => $user ? $user->id : null,
            ]
        );

        // ارسال کد
        if ($isMobile) {
            $smsService->sendSmsOtp($identifier, $otpCode);
            $message = 'کد تایید با موفقیت به شماره موبایل شما ارسال شد.';
        } else {
            // ارسال کد به ایمیل (با استفاده از Mail یا Notification)
            // مثال: Mail::to($identifier)->send(new OtpMail($otpCode));
            // برای فعلاً یک پیام ساده برمی‌گردانیم (در صورت نیاز ایمیل را پیاده‌سازی کنید)
            Mail::to($identifier)->send(new OtpMail($otpCode));

            $message = 'کد تایید با موفقیت به ایمیل شما ارسال شد.';
        }

        return response()->json([
            'message' => $message,
            'token' => $token,
            'identifier_type' => $isEmail ? 'email' : 'mobile',
        ], 200);
    }

    public function verifyOtpAndRegister(Request $request)
    {
        $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'otp' => ['required', 'string', 'size:6'],
            'token' => ['required', 'string'],
            'city_id' => ['nullable', 'exists:cities,id'], // در صورت نیاز
        ]);

        $otp = Otp::where('token', $request->token)
            ->where('login_id', $request->identifier)
            ->where('used', 0)
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'کد تایید یافت نشد.'], 422);
        }

        if ($otp->attempts >= 3) {
            return response()->json(['message' => 'تعداد دفعات مجاز این کد به پایان رسید'], 429);
        }

        if (Carbon::now()->diffInMinutes($otp->created_at) > 5) {
            return response()->json(['message' => 'زمان مجاز این کد به پایان رسید'], 422);
        }

        if ($otp->otp_code !== $request->otp) {
            $otp->increment('attempts');
            return response()->json(['message' => 'کد وارد شده صحیح نمی‌باشد'], 422);
        }

        $otp->update(['used' => 1]);

        // پیدا کردن کاربر بر اساس identifier
        $identifier = $request->identifier;
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);

        $user = null;
        if ($isEmail) {
            $user = User::where('email', $identifier)->first();
        } else {
            $user = User::where('mobile', $identifier)->first();
        }

        if ($user) {
            // کاربر موجود – ورود
            Auth::login($user);

            // اگر موبایل یا ایمیل تأیید نشده، تأیید کن
            if ($isEmail && empty($user->email_verified_at)) {
                $user->email_verified_at = Carbon::now();
                $user->save();
            } elseif (!$isEmail && empty($user->mobile_verified_at)) {
                $user->mobile_verified_at = Carbon::now();
                $user->is_active = 1;
                $user->save();
            }

            return response()->json([
                'message' => 'ورود با موفقیت انجام شد',
                'user' => $user,
            ], 200);
        } else {
            // کاربر جدید – ثبت‌نام
            $user = User::create([
                'password' => Hash::make(Str::random(10)),
                'mobile' => $isEmail ? null : $identifier,
                'email' => $isEmail ? $identifier : null,
                'city_id' => $request->city_id ?? null,
            ]);

            if ($isEmail) {
                $user->email_verified_at = Carbon::now();
            } else {
                $user->mobile_verified_at = Carbon::now();
                $user->is_active = 1;
            }
            $user->save();

            event(new Registered($user));
            Auth::login($user);

            return response()->json([
                'message' => 'ثبت‌نام و ورود با موفقیت انجام شد',
                'user' => $user,
            ], 200);
        }
    }



    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    // public function store(Request $request): Response
    // {
    //     $request->validate([
    //         'name' => ['required', 'string', 'max:255'],
    //         'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
    //         'password' => ['required', 'confirmed', Rules\Password::defaults()],
    //         'mobile' => ['required', 'string', 'max:15', 'unique' . User::class],
    //         'city_id' => ['required', 'exists:cities,id'],
    //     ]);

    //     $user = User::create([
    //         'name' => $request->name,
    //         'email' => $request->email,
    //         'password' => Hash::make($request->string('password')),
    //         'mobile' => $request->mobile,
    //         'city_id' => $request->city_id,
    //     ]);

    //     event(new Registered($user));

    //     Auth::login($user);

    //     return response()->noContent();
    // }
}
