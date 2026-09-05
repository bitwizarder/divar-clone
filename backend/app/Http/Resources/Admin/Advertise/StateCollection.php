<?php

namespace App\Http\Resources\Admin\Advertise;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class StateCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $stateCount;

    public function __construct($resource, int $stateCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->stateCount = $stateCount;
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
            'data' => StateResource::collection($this->collection),
            'state_count' => $this->stateCount,
            'trash_count' => $this->trashCount,
            'status' => true,
        ];
    }
}
