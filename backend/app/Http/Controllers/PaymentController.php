<?php

namespace App\Http\Controllers;

use App\Models\Advertise\FeaturedAdvertisement;
use App\Models\Payment;
use Illuminate\Http\Request;
use App\Http\Services\Payment\ZarinpalService;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function createPayment(Request $request, ZarinpalService $zarinpalService)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'description' => 'required|string|max:255',
        ]);

        // $result = $zarinpalService->createPayment(
        //     $request->amount,
        //     $request->description,
        //     4,
        //     1,
        //     route('payment.verify')
        // );
        $user = auth()->user();

        $result = $zarinpalService->createPayment(
            $request->amount,
            $request->description,
            $user->id,
            $request->advertisement_id,
            route('payment.verify')
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }


    public function verifyPayment(Request $request, ZarinpalService $zarinpalService)
    {

        $authority = $request->input('Authority') ?? $request->input('authority');
        $status = $request->input('Status') ?? $request->input('status');

        if (!$authority || !$status) {
            // return response()->json([
            //     'success' => false,
            //     'message' => 'اطلاعات تراکنش معتبر نیست',
            // ], 400);
            return redirect('http://localhost:3000/success-payment?Authority=&Status=NOK');
        }

        if ($status != 'OK') {

            // return response()->json([
            //     'success' => false,
            //     'message' => 'تراکنش ناموفق بود',
            // ], 400);
            return redirect('http://localhost:3000/success-payment?Authority=&Status=NOK');
        }

        $payment = Payment::where('authority', $authority)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'تراکنش یافت نشد',
            ], 400);
        }

        $result = $zarinpalService->verifyPayment($authority, $payment->amount);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'خطا در تایید تراکنش',
            ], 400);
        }

        // آپدیت وضعیت پرداخت
        $payment->update([
            'status' => 'paid',
            'ref_id' => $result['payment']['ref_id'] ?? null,
            'card_pan' => $result['payment']['card_pan'] ?? null,
            'gateway_response' => $result['payment']['gateway_response'] ?? null,
        ]);

        // ایجاد رکورد ویژه برای آگهی
        FeaturedAdvertisement::create([
            'advertisement_id' => $payment->advertisement_id,
            'user_id' => $payment->user_id,
            'payment_id' => $payment->id,
            'expires_at' => Carbon::now()->addMonth(),
            'is_active' => true,
        ]);

        return redirect('http://localhost:3000/success-payment?Authority=' . $authority . '&Status=OK');
    }



    public function getPayment($id)
    {
        $user = auth()->user();

        $payment = Payment::find($id)->where('user_id',  $user->id)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'تراکنش یافت نشد',
            ], 400);
        }

        return response()->json($payment, 200);
    }
}
