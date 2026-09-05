<?php

namespace App\Http\Services\Sms;

use SoapClient;
use SoapFault;

class SmsService
{

    private $username;
    private $password;
    private $from;

    public function __construct()
    {

        $this->username = config('sms.username');
        $this->password = config('sms.password');
        $this->from = config('sms.from');
    }

    public function sendSmsOtp($phoneNumber, $otpCode)
    {

        try {
            $client = new SoapClient('https://api.payamak-panel.com/post/send.asmx?wsdl', ['encoding' => 'UTF-8']);
            $parameters = [
                'username' => $this->username,
                'password' => $this->password,
                'to' => $phoneNumber,
                'from' => $this->from,
                'text' => 'کد تایید شما :' . $otpCode,
                'isflash' => false,
            ];

            $result = $client->SendSimpleSms2($parameters);
            return $result;
        } catch (SoapFault $soapFault) {
            throw new \Exception('خطا در ارسال پیامک' . $soapFault->faultstring);
        }
    }
}
