<?php

namespace App\Http\Requests\Admin\Content;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePageRequest extends FormRequest
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
            'title' => 'nullable|min:2|regex:/^[\p{L}\p{N}\s\-،,\.:؛()؟؟!!""\'\'«»\p{Zs}]+$/u',
            'body' => 'required|string',
            'status' => 'required|numeric|in:0,1',
        ];
    }
}
