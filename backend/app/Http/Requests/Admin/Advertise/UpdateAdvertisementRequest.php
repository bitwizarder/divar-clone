<?php

namespace App\Http\Requests\Admin\Advertise;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAdvertisementRequest extends FormRequest
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
            'title' => 'required|min:2|regex:/^[\p{L}\p{N}\s\-،,\.:؛()؟؟!!""\'\'«»\p{Zs}]+$/u',
            'description' => 'required',
            'ads_status' => 'nullable',
            'category_id' => 'required|min:1|exists:categories,id',
            'user_id' => 'required|min:1|exists:users,id',
            'city_id' => 'required|min:1|exists:cities,id',
            'status' => 'required|numeric|in:0,1,2,3',
            'published_at' => 'nullable|date',
            'expired_at' => 'nullable|date',
            'contact' => 'nullable',
            'is_special' => 'nullable|numeric|in:0,1',
            'is_ladder' => 'nullable|numeric|in:0,1',
            'image' => 'nullable|max:2000|image|mimes:png,jpg,jpeg,gif',
            'price' => 'nullable|numeric',
            'tags' => 'nullable',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'willing_to_trade' => 'nullable|numeric|in:0,1',
            'category_value_ids' => 'nullable|array',
            'category_value_ids.*' => 'exists:category_values,id'

        ];
    }
}
