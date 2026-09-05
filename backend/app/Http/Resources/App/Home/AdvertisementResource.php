<?php

namespace App\Http\Resources\App\Home;

use App\Http\Resources\Admin\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use function Pest\Laravel\get;

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
            'category' => new CategoryResource($this->whenLoaded('category')),
            'allCategory' => $this->getAllCategories($this->category),
            // 'user' => new UserResource($this->whenLoaded('user')),
            'city' => new CityResource($this->whenLoaded('city')),
            'state' => new StateResource($this->whenLoaded('state')),

            'gallery' => $this->whenLoaded('images', function () {
                return $this->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->image,
                    ];
                });
            }),

            'category_attributes' => $this->whenLoaded('category', function () {
                return $this->category->attributes->map(function ($attribute) {
                    return [
                        'id' => $attribute->id,
                        'name' => $attribute->name,
                        'unit' => $attribute->unit,
                    ];
                });
            }),

            'category_values' => $this->whenLoaded('categoryValues', function () {
                return  $this->categoryValues->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'value' => $value->value,
                    ];
                });
            }),

            'category_attributes_with_values' => $this->whenLoaded('category', function () {
                // return $this->category->attributes->map(function ($attribute) {
                //     return [
                //         'id' => $attribute->id,
                //         'name' => $attribute->name,
                //         'unit' => $attribute->unit,
                //         'value' => $this->categoryValues->map(function ($value) use ($attribute) {
                //             if ($value->categoryAttribute->id === $attribute->id) {
                //                 return [
                //                     'id' => $value->id,
                //                     'value' => $value->value,
                //                 ];
                //             }
                //         })->filter()->values(),
                //     ];
                // });

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
            // 'updated_at' => $this->updated_at,

        ];
    }
    private function getAllCategories($category)
    {
        $all = [];
        while ($category) {
            $all[] = [
                'id' => $category->id,
                'name' => $category->name
            ];
            $category = $category->parent;
        }
        return array_reverse($all);
    }

    public function with(Request $request)
    {
        return [
            'status' => true,
        ];
    }
}
