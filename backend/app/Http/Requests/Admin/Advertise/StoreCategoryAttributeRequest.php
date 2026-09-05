<?php

namespace App\Http\Requests\Admin\Advertise;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryAttributeRequest extends FormRequest
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
            'name' => 'required',
            'unit' => 'required',
            'type' => 'required|numeric|in:0,1',
            'status' => 'required|numeric|in:0,1',
            'category_id' => 'required|min:1|exists:categories,id',

        ];
    }
}
