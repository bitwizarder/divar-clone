<?php

namespace App\Http\Requests\Admin\Advertise;

use App\Models\Advertise\State;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|min:2',
            'description' => 'nullable|min:2',
            'status' => 'required|numeric|in:0,1',
            'icon' => 'nullable|min:2',
            'parent_id' => 'nullable|min:1|exists:categories,id',
             'city_id' => [
            'required_without:parent_id',
            'exists:cities,id',
            // اگر parent_id وجود دارد، city_id باید با شهر والد یکی باشد
            function ($attribute, $value, $fail) {
                $parentId = request('parent_id');
                if ($parentId) {
                    $parent = State::find($parentId);
                    if ($parent && $parent->city_id != $value) {
                        $fail('شهر انتخاب‌شده با شهر والد هماهنگ نیست.');
                    }
                }
            },
        ],

        ];
    }
}
