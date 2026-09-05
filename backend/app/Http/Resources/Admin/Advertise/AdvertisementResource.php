<?php

namespace App\Http\Resources\Admin\Advertise;

use App\Http\Resources\Admin\Content\CityResource;
use App\Http\Resources\Admin\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdvertisementResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'ads_type' => $this->ads_type,
            'ads_status' => $this->ads_status,
            // 'category' => $this->category,
            'user_id' => $this->user_id,
            // 'city' => $this->city,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'user' => new UserResource($this->whenLoaded('user')),
            'city' => new CityResource($this->whenLoaded('city')),
            'state' => new StateResource($this->whenLoaded('state')),
            'categoryValues' => new CategoryValueCollection($this->whenLoaded('categoryValues')),
            'gallery' => $this->whenLoaded('images', function () {
                return $this->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->image,
                    ];
                });
            }),
            'category_attributes_with_values' => $this->whenLoaded('category', function () {
                return
                    $this->category->attributes->map(function ($attribute) {
                        $value = $this->categoryValues()->firstWhere('category_attribute_id', $attribute->id);
                        // dd($value ? $value->value : null);
                        return [
                            'id' => $attribute->id,
                            'name' => $attribute->name,
                            'unit' => $attribute->unit,
                            'value' => $value ? $value->value : null,
                        ];
                    });
            }),
            'published_at' => $this->published_at,
            'expired_at' => $this->expired_at,
            'view' => $this->view,
            'contact' => $this->contact,
            'is_special' => $this->is_special, // Accessor
            'featured_expires_at' => $this->whenLoaded("featuredAdvertisement", function () {
                return $this->featuredAdvertisement?->expires_at;
            }),

            'is_ladder' => $this->is_ladder,
            'image' => $this->image,
            'slug' => $this->slug,
            'price' => $this->price,
            'tags' => $this->tags,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'willing_to_trade' => $this->willing_to_trade,

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
