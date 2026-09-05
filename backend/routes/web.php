<?php

use App\Http\Controllers\ImageController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__ . '/auth.php';


// Route::get('image', [ImageController::class, 'index'])->name('image');
// Route::post('image/store', [ImageController::class, 'store'])->name('image.store');

Route::get('sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
