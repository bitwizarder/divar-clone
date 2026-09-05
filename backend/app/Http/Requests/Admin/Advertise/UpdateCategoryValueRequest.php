<?php

namespace App\Http\Requests\Admin\Advertise;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryValueRequest extends FormRequest
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
            'value' => 'required|min:2',
            'status' => 'required|numeric|in:0,1',
            'type' => 'required|numeric|in:0,1',
            'category_attribute_id' => 'required|min:1|exists:category_attributes,id',
        ];
    }
}
