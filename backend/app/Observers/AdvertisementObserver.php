<?php

namespace App\Observers;

use App\Models\Advertise\Advertisement;

class AdvertisementObserver
{
    public function retrieved(Advertisement $advertisement)
    {
        // هر بار که مدل از دیتابیس خوانده می‌شود، مقدار is_special را بررسی کن
        $featured = $advertisement->featuredAdvertisement;
        if ($featured && $featured->expires_at > now()) {
            $advertisement->is_special = 1;
        } else {
            $advertisement->is_special = 0;
        }
        $advertisement->save();
    }
}
