<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryValueCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $categoryValueCount;

    public function __construct($resource, int $categoryValueCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->categoryValueCount = $categoryValueCount;

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
            'data' => CategoryValueResource::collection($this->collection),
            'categoryValue_count' => $this->categoryValueCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
