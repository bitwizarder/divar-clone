<?php

namespace App\Http\Resources\App\Home;


use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class StateResource extends JsonResource
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
            'parent_id' => $this->parent_id,
            'parent' => new StateResource($this->whenLoaded('parent')),
            'children' => StateResource::collection($this->whenLoaded('children')),
            'city_id' => $this->city_id,
            'city' => new CityResource($this->whenLoaded('city')),
            'description' => $this->description,
            'status' => $this->status,
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
