<?php

namespace App\Http\Resources\Admin\Content;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PageCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $pageCount;

    public function __construct($resource, int $pageCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->pageCount = $pageCount;
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
            'data' => PageResource::collection($this->collection),
            'page_count' => $this->pageCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
