<?php

namespace App\Http\Services\Payment;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;


class ZarinpalService
{
    private $merchantId;

    private $baseUrl;

    public function __construct()
    {
        $this->merchantId = config('services.zarinpal.merchant_id');
        $this->baseUrl = config('services.zarinpal.base_url');
    }

    public function createPayment($amount, $description, $userId, $advertisementId, $callbackUrl)
    {

        $response = Http::withOptions([
            'verify' => false, // غیرفعال کردن بررسی SSL
        ])->post($this->baseUrl . '/pg/v4/payment/request.json', [
            'merchant_id' => $this->merchantId,
            'amount' => $amount,
            'description' => $description,
            'callback_url' => $callbackUrl,
            'metadata' => [
                'userId' => $userId,
                'advertisementId' => $advertisementId,
            ],
        ]);
        $result = $response->json();

        if (isset($result['data']['code']) && $result['data']['code'] == 100) {
            $payment = Payment::create([
                'user_id' => $userId,
                'advertisement_id' => $advertisementId,
                'amount' => $amount,
                'description' => $description,
                'authority' => $result['data']['authority'],
                'status' => 'pending',
                'gateway_response' => $result,
            ]);

            return [
                'success' => true,
                'payement_url' => $this->baseUrl . '/pg/StartPay/' . $result['data']['authority'],
                'authority' => $result['data']['authority'],
                'payment_id' => $payment->id,
            ];
        }

        return [
            'success' => false,
            'message' => 'خطا در ایجاد تراکنش',
        ];
    }


    public function verifyPayment($authority, $amount)
    {

        $response = Http::withOptions([
            'verify' => false, // غیرفعال کردن بررسی SSL
        ])->post($this->baseUrl . '/pg/v4/payment/verify.json', [
            'merchant_id' => $this->merchantId,
            'authority' => $authority,
            'amount' => $amount,
        ]);

        $result = $response->json();

        if (isset($result['data']['code']) && $result['data']['code'] == 100) {
            $payment = Payment::where('authority', $authority)->first();

            if ($payment) {
                $payment->update([
                    'status' => 'paid',
                    'ref_id' => $result['data']['ref_id'],
                    'card_pan' => $result['data']['card_pan'] ?? null,
                    'trace_no' => $result['data']['trace_no'] ?? null,
                    'gateway_response' => $result,
                ]);

                return [
                    'success' => true,
                    'message' => 'تراکنش با موفقیت انجام شد',
                    'payment' => $payment,
                ];
            }

            return [
                'success' => false,
                'message' => 'تراکنش یافت نشد',
            ];
        }

        return [
            'success' => false,
            'message' => 'خطا در تایید تراکنش',
        ];
    }
}
