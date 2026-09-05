<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AdvertisementCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $advertisementCount;

    public function __construct($resource, int $advertisementCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->advertisementCount = $advertisementCount;

        $this->trashCount = $trashCount;
    }
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // 'data' => $this->collection,
             'data' => AdvertisementResource::collection($this->collection),
            'advertisement_count' => $this->advertisementCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
