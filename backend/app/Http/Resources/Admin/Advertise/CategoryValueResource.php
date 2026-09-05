<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryValueResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $categoryAttribute = $this->whenLoaded('categoryAttribute');
        return [
            'id' => $this->id,
            'value' => $this->value,
            // 'categoryAttribute' => $this->categoryAttribute,
            'categoryAttribute' => new CategoryAttributeResource($this->whenLoaded('categoryAttribute')),
            'category_attribute_id' => $this->category_attribute_id, // ← این فیلد برای تطابق با فرانت‌اند ضروری است

            'type' => $this->type,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function with(Request $request)
    {
        return [
            'status' => true,
        ];
    }
}
