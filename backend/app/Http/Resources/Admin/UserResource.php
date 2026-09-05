<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\Content\CityResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'mobile' => $this->mobile,
            'mobile_verified_at' => $this->mobile_verified_at,
            'is_active' => $this->is_active,
            'user_type' => $this->user_type,
            'city_id' => $this->city_id,
            'city' => $this->whenLoaded('city', function () {
                return new CityResource($this->city);
            }),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
    public function with(Request $request)
    {
        return [
            'status' => true,
        ];
    }
}
