<?php

namespace App\Http\Resources\App\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class CityResource extends JsonResource
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
            'states' => StateResource::collection($this->whenLoaded('states')),
            'status' => $this->status,
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
