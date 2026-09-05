<?php

namespace App\Http\Controllers\Admin\Advertise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Advertise\StoreCategoryValueRequest;
use App\Http\Requests\Admin\Advertise\UpdateCategoryValueRequest;
use App\Http\Resources\Admin\Advertise\CategoryValueCollection;
use App\Http\Resources\Admin\Advertise\CategoryValueResource;
use App\Models\Advertise\CategoryValue;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class CategoryValueController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // return new CategoryValueCollection(CategoryValue::all());
        $categoryValues = CategoryValue::with('categoryAttribute.category')->get();
        $categoryAttributeCount = CategoryValue::count();
        $trashCount = CategoryValue::onlyTrashed()->count();
        return new CategoryValueCollection($categoryValues, $categoryAttributeCount, $trashCount);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryValueRequest $request)
    {
        $inputs = $request->all();
        $categoryValue = CategoryValue::create($inputs);
        return new CategoryValueResource($categoryValue);
    }

    /**
     * Display the specified resource.
     */
    public function show(CategoryValue $categoryValue)
    {
        $categoryValue->load('categoryAttribute.category');

        return new CategoryValueResource($categoryValue);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryValueRequest $request, CategoryValue $categoryValue)
    {
        $inputs = $request->all();
        $categoryValue->update($inputs);
        return new CategoryValueResource($categoryValue);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CategoryValue $categoryValue)
    {
        $categoryValue->delete();
        return $this->success('مقدار دسته بندی با موفقیت حذف شد.');
    }


    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                'exists:categoryValues,id',
            ],
        ]);

        CategoryValue::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            ' کاربران انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed categoryValues.
     */
    public function trash()
    {
        return new  CategoryValueCollection(
            CategoryValue::onlyTrashed()
                ->with('categoryAttribute.category')
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed state.
     */
    public function restore(int $id)
    {
        $categoryAttribute =  CategoryValue::onlyTrashed()
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
        $categoryAttribute =  CategoryValue::onlyTrashed()
            ->findOrFail($id);

        $categoryAttribute->forceDelete();

        return $this->success(
            'کاربر به‌صورت دائمی حذف شد.'
        );
    }

    /**
     * Bulk restore trashed categoryValues.
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

        CategoryValue::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            ' کاربران انتخاب‌شده با موفقیت بازیابی شدند.'
        );
    }

    /**
     * Bulk permanently delete trashed categoryValues.
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

        CategoryValue::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            ' کاربران انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
