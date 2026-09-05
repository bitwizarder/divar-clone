<?php

namespace App\Http\Resources\App\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'slug' => $this->slug,
            'body' => $this->body,
            'url' => $this->url,
            'status' => $this->status,
        ];
    }

    public function with(Request $request)
    {
        return [
            'status' => true,
        ];
    }
}
