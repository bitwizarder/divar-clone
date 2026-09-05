<?php

namespace App\Http\Requests\Admin\Content;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
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
            'title' => 'required|min:2',
            'url' => 'nullable',
            'position' => 'required|min:2',
            'status' => 'required|numeric|in:0,1',
            'icon' => 'nullable|min:2',
            'parent_id' => 'nullable|min:1|exists:categories,id',

        ];
    }
}
