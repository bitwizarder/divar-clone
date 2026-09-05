<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
class StoreUserRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->whereNull('deleted_at'), // توصیه: با soft delete هماهنگ
            ],
            'mobile' => [
                'nullable',
                'string',
                'digits:11',
                Rule::unique('users')->whereNull('deleted_at'),
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'required|boolean',
            'city_id' => 'nullable|exists:cities,id',
        ];
    }
}
