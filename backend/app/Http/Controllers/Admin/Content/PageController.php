<?php

namespace App\Http\Controllers\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\StorePageRequest;
use App\Http\Requests\Admin\Content\UpdatePageRequest;
use App\Http\Resources\Admin\Content\PageCollection;
use App\Http\Resources\Admin\Content\PageResource;
use App\Models\Content\Page;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class PageController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new PageCollection(Page::all());

        $pages = Page::all();
        $pageCount = Page::count();
        $trashCount = Page::onlyTrashed()->count();
        return new PageCollection($pages, $pageCount, $trashCount);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePageRequest $request)
    {
        $inputs = $request->all();
        $page = Page::create($inputs);
        return new PageResource($page);
    }

    /**
     * Display the specified resource.
     */
    public function show(Page $page)
    {

        // dd($page);
        // return ($page);
        return new PageResource($page);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePageRequest $request, Page $page)
    {
        $inputs = $request->all();
        $page->update($inputs);
        return new PageResource($page);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $page->delete();
        return $this->success('صفحه با موفقیت حذف شد.');
    }


    /**
     * Bulk soft delete trashed pages.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:pages,id',
            ],
        ]);

        Page::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            'منوهای انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed pages.
     */
    public function trash()
    {
        return new PageCollection(
            Page::onlyTrashed()
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed page.
     */
    public function restore(int $id)
    {
        $page = Page::onlyTrashed()
            ->findOrFail($id);

        $page->restore();

        return $this->success(
            'منو با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed page.
     */
    public function forceDestroy(int $id)
    {
        $page = Page::onlyTrashed()
            ->findOrFail($id);

        $page->forceDelete();

        return $this->success(
            'منو به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed pages.
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

        Page::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            'منوهای انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed pages.
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

        Page::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            'منوهای انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
