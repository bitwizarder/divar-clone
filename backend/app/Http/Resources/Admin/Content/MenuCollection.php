<?php

namespace App\Http\Resources\Admin\Content;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class MenuCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $menuCount;

    public function __construct($resource, int $menuCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->menuCount = $menuCount;
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
            'data' => MenuResource::collection($this->collection),
            'menu_count' => $this->menuCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
