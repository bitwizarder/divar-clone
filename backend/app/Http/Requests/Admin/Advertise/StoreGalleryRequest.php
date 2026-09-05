<?php

namespace App\Http\Requests\Admin\Advertise;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGalleryRequest extends FormRequest
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
            'image' => 'required|max:2000|image|mimes:png,jpg,jpeg,gif',
            'advertisement_id' => 'required|min:1|exists:advertisements,id',
            'status' => 'required|numeric|in:0,1',

        ];
    }
}
