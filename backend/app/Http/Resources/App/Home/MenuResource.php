<?php

namespace App\Http\Resources\App\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'url' => $this->url,
            'slug' => $this->slug,
            'position' => $this->position,
            'parent_id' => $this->parent_id,
            'icon' => $this->icon,
            'status' => $this->status,
            'children' => MenuResource::collection($this->whenLoaded('children')), // <-- اضافه کردن children

        ];
    }

    public function with(Request $request)
    {
        return [
            'status' => true,
        ];
    }
}
