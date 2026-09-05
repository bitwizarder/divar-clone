<?php

namespace App\Actions;

use Spatie\Sluggable\Actions\GenerateSlugAction;
use Spatie\Sluggable\SlugOptions;

class PersianSlugGenerateAction extends GenerateSlugAction
{
    public function slugifySource(string $source, SlugOptions $options): string
    {
        // تولید اسلاگ فارسی با حفظ حروف
        $slug = preg_replace('/\s+/', $options->slugSeparator, $source);
        $slug = preg_replace('/[^\p{L}\p{N}\-_]/u', '', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');

        // اگر خالی شد، از 'page' استفاده کن
        return $slug ?: 'page';
    }
}
