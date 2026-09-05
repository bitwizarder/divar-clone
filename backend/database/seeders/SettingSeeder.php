<?php
// php artisan db:seed --class=SettingSeeder

namespace Database\Seeders;

use App\Models\Setting\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        Setting::create([
            'title' => 'دیوار',
            'description' => 'توضیحات سایت دیوار'
        ]);
    }
}
