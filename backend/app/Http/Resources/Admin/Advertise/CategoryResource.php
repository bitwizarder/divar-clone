<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class CategoryResource extends JsonResource
{


    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'parent' => new CategoryResource($this->whenLoaded('parent')),
            'description' => $this->description,
            'icon' => $this->icon,
            // 'trash_count' => $this->trashCount,
            'status' => $this->status,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s')

        ];
    }

    #[Override]
    public function with(Request $request)
    {
        return [
            'status' => true,
        ];
    }
}
