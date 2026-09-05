<?php

namespace App\Http\Controllers\Admin\Advertise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Advertise\StoreCategoryAttributeRequest;
use App\Http\Requests\Admin\Advertise\UpdateCategoryAttributeRequest;
use App\Http\Resources\Admin\Advertise\CategoryAttributeCollection;
use App\Http\Resources\Admin\Advertise\CategoryAttributeResource;
use App\Models\Advertise\Category;
use App\Models\Advertise\CategoryAttribute;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class CategoryAttributeController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new CategoryAttributeCollection(CategoryAttribute::all());
        $categoryAttributes = CategoryAttribute::with('category')->get();
        $categoryAttributeCount = CategoryAttribute::count();
        $trashCount = CategoryAttribute::onlyTrashed()->count();
        return new CategoryAttributeCollection($categoryAttributes, $categoryAttributeCount, $trashCount);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryAttributeRequest $request)
    {
        $inputs = $request->all();
        $categoryAttribute = CategoryAttribute::create($inputs);
        return new CategoryAttributeResource($categoryAttribute);
    }

    /**
     * Display the specified resource.
     */
    public function show(CategoryAttribute $categoryAttribute)
    {
        // بارگذاری ارتباط 'category' روی همان مدل دریافت‌شده
        $categoryAttribute->load('category');
        return new CategoryAttributeResource($categoryAttribute);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryAttributeRequest $request, CategoryAttribute $categoryAttribute)
    {
        $inputs = $request->all();
        $categoryAttribute->update($inputs);
        return new CategoryAttributeResource($categoryAttribute);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CategoryAttribute $categoryAttribute)
    {
        $categoryAttribute->delete();
        return $this->success('ویژگی دسته بندی با موفقیت حذف شد.');
    }

    public function getByCategory(Category $category)
    {
        $attributes = CategoryAttribute::where('category_id', $category->id)
            ->with('values')
            ->get();

        return response()->json($attributes);
    }


    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:categoryAttributes,id',
            ],
        ]);

        CategoryAttribute::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            ' کاربران انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed categoryAttributes.
     */
    public function trash()
    {
        return new  CategoryAttributeCollection(
            CategoryAttribute::onlyTrashed()
                ->with('category')
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed state.
     */
    public function restore(int $id)
    {
        $categoryAttribute =  CategoryAttribute::onlyTrashed()
            ->findOrFail($id);

        $categoryAttribute->restore();

        return $this->success(
            'کاربر با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed state.
     */
    public function forceDestroy(int $id)
    {
        $categoryAttribute =  CategoryAttribute::onlyTrashed()
            ->findOrFail($id);

        $categoryAttribute->forceDelete();

        return $this->success(
            'کاربر به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed categoryAttributes.
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

        CategoryAttribute::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            ' کاربران انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed categoryAttributes.
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

        CategoryAttribute::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            ' کاربران انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
