<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))

    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware): void {

        /*
        |--------------------------------------------------------------------------
        | Sanctum Stateful API
        |--------------------------------------------------------------------------
        |
        | باعث می‌شود درخواست‌های SPA از طریق session cookie احراز هویت شوند.
        |
        */
        $middleware->statefulApi();

        /*
        |--------------------------------------------------------------------------
        | API Middleware
        |--------------------------------------------------------------------------
        |
        | در پروژه‌های Sanctum معمولاً statefulApi() کافی است.
        | بنابراین EnsureFrontendRequestsAreStateful را دوباره prepend نمی‌کنیم
        | تا middleware تکراری نشود.
        |
        */
        //  $middleware->api(prepend: [
        //     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'mobileVerified' => \App\Http\Middleware\EnsureMobileIsVerified::class,
            'admin' => \App\Http\Middleware\CheckAdmin::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) =>
            $request->expectsJson() || $request->is('api/*')
        );

        $exceptions->renderable(function (
            NotFoundHttpException $e,
            $request
        ) {

            if ($request->is('api/*')) {

                $message = $e->getMessage();

                $message = preg_replace_callback(
                    '/model \[([^\]]+)\]/',
                    function ($matches) {

                        $fullPath = $matches[1];

                        $parts = explode('\\', $fullPath);

                        $simpleName = end($parts);

                        return "model [$simpleName]";
                    },
                    $message
                );

                return response()->json([
                    'message' => 'Record Not Found. ' . $message
                ], 404);
            }
        });
    })

    /*
    |--------------------------------------------------------------------------
    | Broadcasting
    |--------------------------------------------------------------------------
    |
    | authorization مربوط به Private Channelها از این endpoint عبور می‌کند.
    |
    */
    ->withBroadcasting(
        __DIR__ . '/../routes/channels.php',
        [
            'prefix' => 'api',
            'middleware' => [
                'api',
                'auth:sanctum',
            ],
        ],
    )

    ->create();
