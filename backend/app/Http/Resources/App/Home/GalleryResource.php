<?php

namespace App\Http\Resources\App\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class GalleryResource extends JsonResource
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
            'image' => $this->image,
            'advertisement_id' => $this->advertisement_id, 
            'advertisement' => new AdvertisementResource($this->whenLoaded('advertisement')),

            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

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
