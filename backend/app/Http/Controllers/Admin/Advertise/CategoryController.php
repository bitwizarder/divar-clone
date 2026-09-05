<?php

namespace App\Http\Controllers\Admin\Advertise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Advertise\StoreCategoryRequest;
use App\Http\Requests\Admin\Advertise\UpdateCategoryRequest;
use App\Http\Resources\Admin\Advertise\CategoryCollection;
use App\Http\Resources\Admin\Advertise\CategoryResource;
use App\Models\Advertise\Category;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new CategoryCollection(Category::with('parent')->get());
        $categories = Category::with('parent')->get();
        $categoryCount = Category::count();
        $trashCount = Category::onlyTrashed()->count();
        return new CategoryCollection($categories, $categoryCount, $trashCount);
    }
 

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $inputs = $request->all();
        $category = Category::create($inputs);
        // return new CategoryCollection(Category::all());
        return new CategoryResource($category);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return new CategoryResource($category);
    }


    /** 
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $inputs = $request->all();
        $category->update($inputs);
        return new CategoryResource($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        // return ['status'=> true, 'msg'=>'دسته بندی با موفقیت حذف شد.'];
        return $this->success('دسته بندی با موفقیت حذف شد.');
    }

    // public function bulkDestroy(Request $request)
    // {
    //     $validated = $request->validate([
    //         'ids' => ['required', 'array', 'min:1'],
    //         'ids.*' => ['integer', 'distinct', 'exists:categories,id'],
    //     ]);

    //     $categories = Category::whereIn('id', $validated['ids'])->get();

    //     foreach ($categories as $category) {
    //         $category->delete();
    //     }

    //     return $this->success(
    //         'دسته‌بندی‌های انتخاب‌شده با موفقیت حذف شدند.'
    //     );
    // }
    /**
     * Bulk soft delete categories.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:categories,id',
            ],
        ]);

        Category::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            'دسته‌بندی‌های انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed categories.
     */
    public function trash()
    {
        return new CategoryCollection(
            Category::onlyTrashed()
                ->with('parent')
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed category.
     */
    public function restore(int $id)
    {
        $category = Category::onlyTrashed()
            ->findOrFail($id);

        $category->restore();

        return $this->success(
            'دسته‌بندی با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed category.
     */
    public function forceDestroy(int $id)
    {
        $category = Category::onlyTrashed()
            ->findOrFail($id);

        $category->forceDelete();

        return $this->success(
            'دسته‌بندی به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed categories.
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

        Category::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            'دسته‌بندی‌های انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed categories.
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

        Category::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            'دسته‌بندی‌های انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
