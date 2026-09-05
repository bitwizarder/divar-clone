<?php

namespace App\Http\Controllers\Admin\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\Admin\UserCollection;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use HttpResponses;
 
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new UserCollection(User::all());
        $users = User::with('city')->get();
        $userCount = User::count();
        $trashCount = User::onlyTrashed()->count();
        return new UserCollection($users, $userCount, $trashCount);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated(); // فقط داده‌های اعتبارسنجی‌شده
        if (empty($validated['email']) && empty($validated['mobile'])) {
            return $this->error('حداقل یکی از ایمیل یا موبایل باید وارد شود.');
        }
        if ($validated['is_active']) {
        }
        $verifiedAt = $validated['is_active'] ? now() : null;

        // $user = new User();
        // $user->forceFill([
        //     'name' => $validated['name'],
        //     'email' => $validated['email'] ?? null,
        //     'mobile' => $validated['mobile'] ?? null,
        //     'is_active' => $validated['is_active'] ? 1 : 0,
        //     'password' => Hash::make($validated['password']),
        //     'mobile_verified_at' => $verifiedAt,
        //     'email_verified_at' => $verifiedAt,
        //     'user_type' => 0,
        //     'city_id' => $validated['city_id'] ?? null,
        // ])->save();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'mobile' => $validated['mobile'] ?? null,
            'city_id' => $validated['city_id'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ? 1 : 0,
            'user_type' => 0,
            'mobile_verified_at' => $validated['mobile'] ? $verifiedAt : null,
            'email_verified_at' => $validated['email'] ? $verifiedAt : null,
        ]);
        return new UserResource($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        // داده‌هایی که همیشه به‌روز می‌شوند
        $user->name = $validated['name'];
        $user->email = $validated['email'] ?? null;
        $user->mobile = $validated['mobile'] ?? null;
        $user->is_active = $validated['is_active'] ? 1 : 0;
        $user->city_id = $validated['city_id'] ?? null;
        // $user->mobile_verified_at = $validated['mobile'] ? $user->mobile_verified_at ?? now() : null;
        // $user->email_verified_at = $validated['email'] ? $user->email_verified_at ?? now() : null;

        // اگر رمز عبور جدید ارسال شده باشد، آن را هش و ذخیره کن
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // (اختیاری) اگر ایمیل یا موبایل تغییر کرده، تاریخ تأیید را null کن تا دوباره تأیید شود
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        if ($user->isDirty('mobile')) {
            $user->mobile_verified_at = null;
        }

        $user->save();

        return new UserResource($user);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return $this->success('کاربر با موفقیت حذف شد.');
    }



    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:users,id',
            ],
        ]);

        User::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            ' کاربران انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed users.
     */
    public function trash()
    {
        return new  UserCollection(
            User::onlyTrashed()
                ->with('city')
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed state.
     */
    public function restore(int $id)
    {
        $user =  User::onlyTrashed()
            ->findOrFail($id);

        $user->restore();

        return $this->success(
            'کاربر با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed state.
     */
    public function forceDestroy(int $id)
    {
        $user =  User::onlyTrashed()
            ->findOrFail($id);

        $user->forceDelete();

        return $this->success(
            'کاربر به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed users.
     */
    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
            ],
        ]);

        User::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            ' کاربران انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed users.
     */
    public function bulkForceDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
            ],
        ]);

        User::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            ' کاربران انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
