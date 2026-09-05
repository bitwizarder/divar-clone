<?php
// php artisan db:seed --class=StateSeeder

namespace Database\Seeders;

use App\Models\Advertise\State;
use App\Models\Geo\City;
use Illuminate\Database\Seeder;

class StateSeeder extends Seeder
{
    public function run(): void
    {
        // ================================================================
        // ۱. ابتدا شهرها را دریافت می‌کنیم
        // ================================================================
        $tehran = City::where('name', 'تهران')->first();
        $mashhad = City::where('name', 'مشهد')->first();
        $isfahan = City::where('name', 'اصفهان')->first();
        $shiraz = City::where('name', 'شیراز')->first();
        $tabriz = City::where('name', 'تبریز')->first();
        $karaj = City::where('name', 'کرج')->first();
        $qom = City::where('name', 'قم')->first();
        $ahvaz = City::where('name', 'اهواز')->first();
        $kermanshah = City::where('name', 'کرمانشاه')->first();
        $rasht = City::where('name', 'رشت')->first();
        $yazd = City::where('name', 'یزد')->first();
        $kerman = City::where('name', 'کرمان')->first();
        $hamadan = City::where('name', 'همدان')->first();
        $zanjan = City::where('name', 'زنجان')->first();
        $sanandaj = City::where('name', 'سنندج')->first();

        // ================================================================
        // ۲. تعریف محله‌ها با ساختار سلسله‌مراتبی
        // ================================================================

        // ---------- تهران (با ساختار کامل) ----------
        $tehranStates = [
            // شمال تهران
            [
                'name' => 'شمال تهران',
                'description' => 'مناطق شمالی تهران',
                'icon' => 'fa fa-mountain',
                'children' => [
                    ['name' => 'تجریش', 'description' => 'محله تجریش', 'icon' => 'fa fa-tree'],
                    ['name' => 'نیاوران', 'description' => 'محله نیاوران', 'icon' => 'fa fa-palace'],
                    ['name' => 'فرمانیه', 'description' => 'محله فرمانیه', 'icon' => 'fa fa-building'],
                    ['name' => 'سعادت‌آباد', 'description' => 'محله سعادت‌آباد', 'icon' => 'fa fa-city'],
                    ['name' => 'شهرک غرب', 'description' => 'شهرک غرب', 'icon' => 'fa fa-skyline'],
                ],
            ],
            // مرکز تهران
            [
                'name' => 'مرکز تهران',
                'description' => 'مناطق مرکزی تهران',
                'icon' => 'fa fa-flag',
                'children' => [
                    ['name' => 'پاسداران', 'description' => 'محله پاسداران', 'icon' => 'fa fa-flag'],
                    ['name' => 'هروی', 'description' => 'محله هروی', 'icon' => null],
                    ['name' => 'ولیعصر', 'description' => 'خیابان ولیعصر', 'icon' => null],
                    ['name' => 'میرداماد', 'description' => 'محله میرداماد', 'icon' => null],
                    ['name' => 'پونک', 'description' => 'محله پونک', 'icon' => null],
                ],
            ],
            // جنوب تهران
            [
                'name' => 'جنوب تهران',
                'description' => 'مناطق جنوبی تهران',
                'icon' => 'fa fa-factory',
                'children' => [
                    ['name' => 'شهرری', 'description' => 'شهر ری', 'icon' => 'fa fa-landmark'],
                    ['name' => 'درکه', 'description' => 'محله درکه', 'icon' => null],
                    ['name' => 'چهارراه ولیعصر', 'description' => 'چهارراه ولیعصر', 'icon' => null],
                ],
            ],
            // غرب تهران
            [
                'name' => 'غرب تهران',
                'description' => 'مناطق غربی تهران',
                'icon' => 'fa fa-hill',
                'children' => [
                    ['name' => 'صادقیه', 'description' => 'محله صادقیه', 'icon' => null],
                    ['name' => 'آریاشهر', 'description' => 'محله آریاشهر', 'icon' => null],
                ],
            ],
            // شرق تهران
            [
                'name' => 'شرق تهران',
                'description' => 'مناطق شرقی تهران',
                'icon' => 'fa fa-sun',
                'children' => [
                    ['name' => 'نارمک', 'description' => 'محله نارمک', 'icon' => null],
                    ['name' => 'تهرانپارس', 'description' => 'محله تهرانپارس', 'icon' => null],
                    ['name' => 'حکیمیه', 'description' => 'محله حکیمیه', 'icon' => null],
                ],
            ],
        ];

        // ---------- سایر شهرها (محله‌های ساده) ----------
        $mashhadStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز مشهد', 'icon' => 'fa fa-flag'],
            ['name' => 'حرم مطهر', 'description' => 'اطراف حرم', 'icon' => 'fa fa-mosque'],
            ['name' => 'آرامگاه فردوسی', 'description' => 'اطراف آرامگاه', 'icon' => 'fa fa-monument'],
            ['name' => 'شهرک غرب', 'description' => 'شهرک غرب مشهد', 'icon' => null],
        ];

        $isfahanStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز اصفهان', 'icon' => 'fa fa-flag'],
            ['name' => 'نقش جهان', 'description' => 'میدان نقش جهان', 'icon' => 'fa fa-arch'],
            ['name' => 'زاینده‌رود', 'description' => 'اطراف زاینده‌رود', 'icon' => 'fa fa-water'],
            ['name' => 'سپاهان', 'description' => 'محله سپاهان', 'icon' => null],
        ];

        $shirazStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز شیراز', 'icon' => 'fa fa-flag'],
            ['name' => 'حافظیه', 'description' => 'اطراف حافظیه', 'icon' => 'fa fa-pen'],
            ['name' => 'سعدیه', 'description' => 'اطراف سعدیه', 'icon' => 'fa fa-feather'],
            ['name' => 'دریاچه', 'description' => 'دریاچه شیراز', 'icon' => 'fa fa-water'],
        ];

        $tabrizStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز تبریز', 'icon' => 'fa fa-flag'],
            ['name' => 'میدان ساعت', 'description' => 'اطراف میدان ساعت', 'icon' => 'fa fa-clock'],
            ['name' => 'الگو', 'description' => 'محله الگو', 'icon' => null],
        ];

        $karajStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز کرج', 'icon' => 'fa fa-flag'],
            ['name' => 'مهرشهر', 'description' => 'مهرشهر کرج', 'icon' => null],
            ['name' => 'گوهردشت', 'description' => 'گوهردشت', 'icon' => null],
        ];

        $qomStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز قم', 'icon' => 'fa fa-flag'],
            ['name' => 'حرم مطهر', 'description' => 'اطراف حرم', 'icon' => 'fa fa-mosque'],
            ['name' => 'جمهوری', 'description' => 'خیابان جمهوری', 'icon' => null],
        ];

        $ahvazStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز اهواز', 'icon' => 'fa fa-flag'],
            ['name' => 'کیانپارس', 'description' => 'کیانپارس', 'icon' => null],
            ['name' => 'کیانآباد', 'description' => 'کیانآباد', 'icon' => null],
        ];

        $kermanshahStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز کرمانشاه', 'icon' => 'fa fa-flag'],
            ['name' => 'طاق‌بستان', 'description' => 'اطراف طاق‌بستان', 'icon' => 'fa fa-arch'],
            ['name' => 'جلالی', 'description' => 'محله جلالی', 'icon' => null],
        ];

        $rashtStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز رشت', 'icon' => 'fa fa-flag'],
            ['name' => 'سبزه میدان', 'description' => 'سبزه میدان', 'icon' => null],
        ];

        $yazdStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز یزد', 'icon' => 'fa fa-flag'],
            ['name' => 'امیرچقماق', 'description' => 'اطراف امیرچقماق', 'icon' => 'fa fa-arch'],
        ];

        $kermanStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز کرمان', 'icon' => 'fa fa-flag'],
            ['name' => 'میدان شهدا', 'description' => 'اطراف میدان شهدا', 'icon' => null],
        ];

        $hamadanStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز همدان', 'icon' => 'fa fa-flag'],
            ['name' => 'گنج‌نامه', 'description' => 'اطراف گنج‌نامه', 'icon' => 'fa fa-mountain'],
        ];

        $zanjanStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز زنجان', 'icon' => 'fa fa-flag'],
        ];

        $sanandajStates = [
            ['name' => 'مرکزی', 'description' => 'مرکز سنندج', 'icon' => 'fa fa-flag'],
        ];

        // ================================================================
        // ۳. تابع کمکی برای ذخیره‌سازی بازگشتی
        // ================================================================
        $saveState = function ($data, $cityId, $parentId = null) use (&$saveState) {
            foreach ($data as $item) {
                $state = State::create([
                    'name'        => $item['name'],
                    'description' => $item['description'] ?? null,
                    'icon'        => $item['icon'] ?? null,
                    'parent_id'   => $parentId,
                    'city_id'     => $cityId,
                    'status'      => 1,
                ]);

                // اگر فرزندانی داشت، آن‌ها را نیز ذخیره کن
                if (isset($item['children']) && is_array($item['children'])) {
                    $saveState($item['children'], $cityId, $state->id);
                }
            }
        };

        // ================================================================
        // ۴. اجرای ذخیره‌سازی برای هر شهر
        // ================================================================
        if ($tehran) {
            $saveState($tehranStates, $tehran->id);
        }

        if ($mashhad) {
            $saveState($mashhadStates, $mashhad->id);
        }

        if ($isfahan) {
            $saveState($isfahanStates, $isfahan->id);
        }

        if ($shiraz) {
            $saveState($shirazStates, $shiraz->id);
        }

        if ($tabriz) {
            $saveState($tabrizStates, $tabriz->id);
        }

        if ($karaj) {
            $saveState($karajStates, $karaj->id);
        }

        if ($qom) {
            $saveState($qomStates, $qom->id);
        }

        if ($ahvaz) {
            $saveState($ahvazStates, $ahvaz->id);
        }

        if ($kermanshah) {
            $saveState($kermanshahStates, $kermanshah->id);
        }

        if ($rasht) {
            $saveState($rashtStates, $rasht->id);
        }

        if ($yazd) {
            $saveState($yazdStates, $yazd->id);
        }

        if ($kerman) {
            $saveState($kermanStates, $kerman->id);
        }

        if ($hamadan) {
            $saveState($hamadanStates, $hamadan->id);
        }

        if ($zanjan) {
            $saveState($zanjanStates, $zanjan->id);
        }

        if ($sanandaj) {
            $saveState($sanandajStates, $sanandaj->id);
        }

        $this->command->info('✅ محله‌ها با موفقیت سید شدند.');
    }
}
