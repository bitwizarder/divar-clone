<?php

namespace App\Http\Resources\Admin\Advertise;

use App\Http\Resources\Admin\Content\CityResource;
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
            'children' => StateResource::collection($this->whenLoaded('children')),
            'parent' => new StateResource($this->whenLoaded('parent')),
            'city_id' => $this->city_id,
            'city' => new CityResource($this->whenLoaded('city')),
            'description' => $this->description,
            'status' => $this->status,
            'icon' => $this->icon,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,

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
