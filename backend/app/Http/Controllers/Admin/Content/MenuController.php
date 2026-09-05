<?php

namespace App\Http\Controllers\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\StoreMenuRequest;
use App\Http\Requests\Admin\Content\UpdateMenuRequest;
use App\Http\Resources\Admin\Content\MenuCollection;
use App\Http\Resources\Admin\Content\MenuResource;
use App\Models\Content\Menu;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    use HttpResponses;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new MenuCollection(Menu::all());
        $menus = Menu::with('children')->get();
        $menuCount = Menu::count();
        $trashCount = Menu::onlyTrashed()->count();
        return new MenuCollection($menus, $menuCount, $trashCount);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMenuRequest $request)
    {
        $inputs = $request->all();
        $menu = Menu::create($inputs);
        return new MenuResource($menu);
    }

    /**
     * Display the specified resource.
     */
    public function show(Menu $menu)
    {
        return new MenuResource($menu);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMenuRequest $request, Menu $menu)
    {
        $inputs = $request->all();
        $menu->update($inputs);
        return new MenuResource($menu);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        $menu->delete();
        // return ['status' => true, 'msg' => 'منو با موفقیت حذف شد.'];
        return $this->success('منو با موفقیت حذف شد.');
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:menus,id',
            ],
        ]);

        Menu::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            'منوهای انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed menus.
     */
    public function trash()
    {
        return new MenuCollection(
            Menu::onlyTrashed()
                ->with('parent')
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed menu.
     */
    public function restore(int $id)
    {
        $menu = Menu::onlyTrashed()
            ->findOrFail($id);

        $menu->restore();

        return $this->success(
            'منو با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed menu.
     */
    public function forceDestroy(int $id)
    {
        $menu = Menu::onlyTrashed()
            ->findOrFail($id);

        $menu->forceDelete();

        return $this->success(
            'منو به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed menus.
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

        Menu::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            'منوهای انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed menus.
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

        Menu::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            'منوهای انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
