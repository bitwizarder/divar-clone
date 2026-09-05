<?php

namespace App\Http\Controllers\Admin\Advertise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Advertise\StoreStateRequest;
use App\Http\Requests\Admin\Advertise\UpdateStateRequest;
use App\Http\Resources\Admin\Advertise\StateCollection;
use App\Http\Resources\Admin\Advertise\StateResource;
use App\Models\Advertise\State;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class StateController extends Controller
{
    use HttpResponses;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        // return new StateCollection(State::with('children')->get());

        $states = State::with(['children', 'parent', 'city'])->get();
        $stateCount = State::count();
        $trashCount = State::onlyTrashed()->count();
        return new StateCollection($states, $stateCount, $trashCount);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStateRequest $request)
    {
        $inputs = $request->all();
        $state = State::create($inputs);
        return new StateResource($state);
    }

    /**
     * Display the specified resource.
     */
    public function show(State $state)
    {
        return new StateResource($state);
    }


    /** 
     * Update the specified resource in storage.
     */
    public function update(UpdateStateRequest $request, State $state)
    {
        $inputs = $request->all();

        // اگر والد تغییر کرده و والد جدید city_id دارد، آن را به فرزند اعمال کن
        if ($request->has('parent_id') && $request->parent_id) {
            $parent = State::find($request->parent_id);
            if ($parent && $parent->city_id) {
                $inputs['city_id'] = $parent->city_id;
            }
        }

        $state->update($inputs);

        // اگر city_id تغییر کرده، همه فرزندان را به‌روز کن (اختیاری)
        if ($state->wasChanged('city_id')) {
            State::where('parent_id', $state->id)->update(['city_id' => $state->city_id]);
        }
        return new StateResource($state);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(State $state)
    {
        $state->delete();
        // return ['status'=> true, 'msg'=>'منطقه با موفقیت حذف شد.'];
        return $this->success('منطقه با موفقیت حذف شد.');
    }


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

        State::whereIn('id', $validated['ids'])
            ->get()
            ->each
            ->delete();

        return $this->success(
            'منطقه‌های انتخاب‌شده به سطل زباله منتقل شدند.'
        );
    }

    /**
     * Display trashed categories.
     */
    public function trash()
    {
        return new StateCollection(
            State::onlyTrashed()
                ->with('parent')
                ->latest('deleted_at')
                ->get()
        );
    }

    /**
     * Restore a trashed state.
     */
    public function restore(int $id)
    {
        $state = State::onlyTrashed()
            ->findOrFail($id);

        $state->restore();

        return $this->success(
            'منطقه با موفقیت بازیابی شد.'
        );
    }

    /**
     * Permanently delete a trashed state.
     */
    public function forceDestroy(int $id)
    {
        $state = State::onlyTrashed()
            ->findOrFail($id);

        $state->forceDelete();

        return $this->success(
            'منطقه به‌صورت دائمی حذف شد.'
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

        State::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return $this->success(
            'منطقه‌های انتخاب‌شده با موفقیت بازیابی شدند.'
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

        State::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->forceDelete();

        return $this->success(
            'منطقه‌های انتخاب‌شده به‌صورت دائمی حذف شدند.'
        );
    }
}
