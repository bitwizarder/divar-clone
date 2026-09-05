<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMobileIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->mobile_verified_at) {
            return response()->json(['message' => 'شماره موبایل تایید نشده است'], 403);
        }

        return $next($request);
    }
}
