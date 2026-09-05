<?php

namespace App\Traits;

trait HttpResponses
{

    protected function success($message = null, $code = 200, $data = null,)
    {
        return response()->json([
            'status' => true,
            'statusTxt' => 'Request Was Successful',
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function error($message = null, $code = 400, $data = null)
    {
        return response()->json([
            'statusTxt' => 'Request Error!',
            'status' => false,
            'message' => $message,
            'data' => $data,
        ], $code);
    }
}
