<?php

namespace App\Http\Requests\App;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdvertisementRequest extends FormRequest
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
            'ads_status' => 'required|string',
            'ads_type' => 'nullable|regex:/^[\p{L}\p{N}\s\-،,\.:؛()؟؟!!""\'\'«»\p{Zs}]+$/u',
            'category_id' => 'required|min:1|exists:categories,id',
            'city_id' => 'required|min:1|exists:cities,id',
            'state_id' => 'required|min:1|exists:states,id',
            'contact' => 'nullable',
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
