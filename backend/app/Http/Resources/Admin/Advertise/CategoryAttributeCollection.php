<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryAttributeCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $categoryAttributeCount;

    public function __construct($resource, int $categoryAttributeCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->categoryAttributeCount = $categoryAttributeCount;

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
            'data' => CategoryAttributeResource::collection($this->collection),
            'categoryAttribute_count' => $this->categoryAttributeCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
