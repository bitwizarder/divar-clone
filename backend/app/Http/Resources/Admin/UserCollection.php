<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    protected int $trashCount;
    protected int $userCount;

    public function __construct($resource, int $userCount = 0, int $trashCount = 0)
    {
        parent::__construct($resource);
        $this->userCount = $userCount;
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
            'data' => UserResource::collection($this->collection),
            'user_count' => $this->userCount,
            'trash_count' => $this->trashCount,
            // 'meta' => [
            //     'total' => $this->total(),
            //     'per_user' => $this->perPage(),
            //     'current_user' => $this->currentPage(),
            //     'last_user' => $this->lastPage(),
            // ],
            'status' => true,


        ];
    }
}
