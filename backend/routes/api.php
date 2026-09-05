<?php

use App\Http\Controllers\Admin\Advertise\AdvertisementController;
use App\Http\Controllers\Admin\Advertise\CategoryAttributeController;
use App\Http\Controllers\Admin\Advertise\CategoryController;
use App\Http\Controllers\Admin\Advertise\CategoryValueController;
use App\Http\Controllers\Admin\Advertise\GalleryController;
use App\Http\Controllers\Admin\Advertise\StateController;
use App\Http\Controllers\Admin\Content\MenuController;
use App\Http\Controllers\Admin\Content\PageController;
use App\Http\Controllers\Admin\Setting\SettingController;
use App\Http\Controllers\Admin\User\UserController;
use App\Http\Controllers\App\Home\AdvertisementController as HomeAdvertisementController;
use App\Http\Controllers\App\Home\CategoryController as HomeCategoryController;
use App\Http\Controllers\App\Home\CityController;
use App\Http\Controllers\App\Home\MenuController as HomeMenuController;
use App\Http\Controllers\App\Home\PageController as HomePageController;
use App\Http\Controllers\App\Home\StateController as HomeStateController;
use App\Http\Controllers\App\panel\AdvertisementController as PanelAdvertisementController;
use App\Http\Controllers\App\Panel\AdvertisementNoteController;
use App\Http\Controllers\App\Panel\FavoriteAdvertisementController;
use App\Http\Controllers\App\Panel\GalleryController as PanelGalleryController;
use App\Http\Controllers\App\Panel\HistoryAdvertisementController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Chat\ChatController;
use App\Http\Controllers\PaymentController;
use App\Models\Chat\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/categories', [HomeCategoryController::class, 'index'])->name('categories');
Route::get('/all-categories', [HomeCategoryController::class, 'allCategories'])->name('categories');
Route::get('/states', [HomeStateController::class, 'index'])->name('states');
Route::get('/cities', [CityController::class, 'index'])->name('cities');
Route::get('/menus', [HomeMenuController::class, 'index'])->name('menus');
Route::get('/pages', [HomePageController::class, 'index'])->name('pages');
Route::get('/advertisements', [HomeAdvertisementController::class, 'index'])->name('advertisements');
Route::get('/advertisements/{advertisement}', [HomeAdvertisementController::class, 'show'])->name('advertisement.show');
Route::get('/settings', [SettingController::class, 'index']);




Route::post('/send-otp', [RegisteredUserController::class, 'sendOtp'])->middleware('guest');
Route::post('/verify-otp', [RegisteredUserController::class, 'verifyOtpAndRegister'])->middleware('guest');


Route::prefix('admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {

    Route::apiResource('setting', SettingController::class);


    Route::prefix('advertise')->name('advertise.')->group(function () {

        Route::prefix('category')->name('category.')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [CategoryController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [CategoryController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [CategoryController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [CategoryController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [CategoryController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [CategoryController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('category', CategoryController::class);


        Route::prefix('state')->name('state.')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [StateController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [StateController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [StateController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [StateController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [StateController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [StateController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('state', StateController::class);

        Route::prefix('category-attribute')->name('category-attribute')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [CategoryAttributeController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [CategoryAttributeController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [CategoryAttributeController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [CategoryAttributeController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [CategoryAttributeController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [CategoryAttributeController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('category-attribute', CategoryAttributeController::class);
        Route::get('/category-attributes/by-category/{category}', [CategoryAttributeController::class, 'getByCategory'])
            ->name('category-attributes.by-category');

        Route::prefix('category-value')->name('category-value')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [CategoryValueController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [CategoryValueController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [CategoryValueController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [CategoryValueController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [CategoryValueController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [CategoryValueController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('category-value', CategoryValueController::class);

        Route::prefix('advertisement')->name('advertisement')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [AdvertisementController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [AdvertisementController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [AdvertisementController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [AdvertisementController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [AdvertisementController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [AdvertisementController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('advertisement', AdvertisementController::class);




        Route::apiResource('{advertisement_id}/gallery', GalleryController::class);
    });

    Route::prefix('content')->name('content.')->group(function () {

        Route::prefix('menu')->name('menu.')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [MenuController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [MenuController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [MenuController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [MenuController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [MenuController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [MenuController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('menu', MenuController::class);

        Route::prefix('page')->name('page.')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [PageController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [PageController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [PageController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [PageController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [PageController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [PageController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('page', PageController::class);
    });



    Route::prefix('users')->name('users')->group(function () {
        Route::prefix('user')->name('user')->group(function () {
            // Bulk actions
            Route::delete('/bulk', [UserController::class, 'bulkDestroy'])
                ->name('bulk-destroy');

            Route::get('/trash', [UserController::class, 'trash'])
                ->name('trash');

            Route::patch('/trash/{id}/restore', [UserController::class, 'restore'])
                ->name('restore');

            Route::delete('/trash/{id}', [UserController::class, 'forceDestroy'])
                ->name('force-destroy');

            Route::patch('/trash/restore', [UserController::class, 'bulkRestore'])
                ->name('bulk-restore');

            Route::delete('/trash', [UserController::class, 'bulkForceDestroy'])
                ->name('bulk-force-destroy');
        });
        Route::apiResource('user', UserController::class);
    });
});

// User Panel
Route::prefix('panel')->middleware(['auth:sanctum', 'mobileVerified'])->name('panel.')->group(function () {
    Route::prefix('advertise')->name('advertise.')->group(function () {
        Route::apiResource('advertisement', PanelAdvertisementController::class);

        Route::prefix('gallery')->name('gallery.')->group(function () {
            Route::get('/{advertisement}', [PanelGalleryController::class, 'index'])->name('index');
            Route::post('/store/{advertisement}', [PanelGalleryController::class, 'store'])->name('store');
            Route::get('/show/{gallery}', [PanelGalleryController::class, 'show'])->name('show');
            Route::put('/{gallery}', [PanelGalleryController::class, 'update'])->name('update');
            Route::delete('/destroy/{gallery}', [PanelGalleryController::class, 'destroy'])->name('destroy');
        });


        Route::prefix('notes')->name('notes.')->group(function () {
            Route::get('/', [AdvertisementNoteController::class, 'index'])->name('index');
            Route::post('/store/{advertisement}', [AdvertisementNoteController::class, 'store'])->name('store');
            Route::get('/show/{advertisement}', [AdvertisementNoteController::class, 'show'])->name('show');
            Route::delete('/destroy/{advertisement}', [AdvertisementNoteController::class, 'destroy'])->name('destroy');
        });
    });
    Route::prefix('favorites')->name('favorites.')->group(function () {
        Route::get('/', [FavoriteAdvertisementController::class, 'index'])->name('index');
        Route::post('/{advertisement}', [FavoriteAdvertisementController::class, 'store'])->name('store');
        Route::delete('/{advertisement}', [FavoriteAdvertisementController::class, 'destroy'])->name('destroy');
    });


    Route::prefix('history')->name('history.')->group(function () {
        Route::get('/', [HistoryAdvertisementController::class, 'index'])->name('index');
        Route::post('/{advertisement}', [HistoryAdvertisementController::class, 'store'])->name('store');
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chat/conversations', [ChatController::class, 'conversations']);
    Route::get('/chat/conversations/{conversation}', [ChatController::class, 'show']);
    Route::post('/chat/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    Route::patch('/chat/conversations/{conversation}/read', [ChatController::class, 'markAsRead']);
    Route::post('/chat/start', [ChatController::class, 'startConversation']);
});



// Route::post('image/store', [ImageController::class, 'store'])->name('image.store');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum');


Route::prefix('payments')->name('payment.')->group(function () {
    Route::post('/create', [PaymentController::class, 'createPayment'])->name('create');
    Route::get('/verify', [PaymentController::class, 'verifyPayment'])->name('verify');
    Route::get('/{id}', [PaymentController::class, 'getPayment'])->name('show');
});


