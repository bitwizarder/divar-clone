<?php

namespace App\Http\Resources\App\Home;

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
            // 'children' => $this->children,
            'children' => CategoryResource::collection($this->whenLoaded('children')), 

            'slug' => $this->slug,
            'icon' => $this->icon,
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
