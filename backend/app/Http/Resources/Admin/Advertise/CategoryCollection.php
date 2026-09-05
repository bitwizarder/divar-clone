<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $categoryCount;


    public function __construct($resource, int $categoryCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->categoryCount = $categoryCount;
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
            'data' => CategoryResource::collection($this->collection),
            'category_count' => $this->categoryCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
