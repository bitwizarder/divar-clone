<?php

namespace App\Http\Services\Image;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;


class ImageService extends ImageToolsService
{
    protected function getFormatObject(string $format): Format
    {
        return match (strtolower($format)) {
            'jpg', 'jpeg' => Format::JPEG,
            'png'       => Format::PNG,
            'gif'       => Format::GIF,
            'webp'      => Format::WEBP,
            'bmp'       => Format::BMP,
            'tiff'      => Format::TIFF,
            default     => Format::JPEG,
        };
    }
    public function save($image)
    {
        $this->setImage($image);
        $this->provider();


        // create image manager instance using the desired driver
        $manager = ImageManager::usingDriver(Driver::class);
        // read image data from path
        $imageInstance = $manager->decodePath($image->getRealPath());

        // scale image by height
        // $image->scale(height: 300);

        // insert a watermark
        // $image->insert('images/watermark.png', alignment: Alignment::BOTTOM_RIGHT);

        // encode edited image
        $encoded = $imageInstance->encodeUsingFormat(
            $this->getFormatObject($this->getImageFormat()),
            quality: 80
        );

        // save encoded image
        $encoded->save(public_path($this->getImageAddress()));

        return $encoded ? $this->getImageAddress() : false;
    }

    public function fitAndSave($image, $width, $height)
    {
        $this->setImage($image);
        $this->provider();
        // create image manager instance using the desired driver
        $manager = ImageManager::usingDriver(Driver::class);
        // read image data from path
        $imageInstance = $manager->decodePath($image->getRealPath());
        // resize to 300 x 200 pixel
        $imageInstance->resizeDown($width, $height);
        // encode edited image
        $encoded = $imageInstance->encodeUsingFormat(
            $this->getFormatObject($this->getImageFormat()),
            quality: 100
        );        // save encoded image
        $encoded->save(public_path($this->getImageAddress()));

        return $encoded ? $this->getImageAddress() : false;
    }
    public function createIndexAndSave($image)
    {
        $imageSizes = Config::get('image.index-image-sizes');
        $this->setImage($image);
        $this->getImageDirectory() ?? $this->setImageDirectory(date('Y') . DIRECTORY_SEPARATOR . date('m') . DIRECTORY_SEPARATOR . date('d'));
        $this->setImageDirectory($this->getImageDirectory() . DIRECTORY_SEPARATOR . time());

        $this->getImageName() ?? $this->setImageName(time() . '-' . Str::uuid()->toString());
        $imageName = $this->getImageName();

        $indexArray = [];
        foreach ($imageSizes as $sizeAlias => $imageSize) {
            $currentImageName = $imageName . '_' . $sizeAlias;
            $this->setImageName($currentImageName);
            $this->provider();

            $manager = ImageManager::usingDriver(Driver::class);

            // 🔥 استفاده از متغیر جدید به جای بازنویسی $image
            $imageInstance = $manager->decodePath($image->getRealPath());
            $imageInstance->resizeDown($imageSize['width'], $imageSize['height']);

            $encoded = $imageInstance->encodeUsingFormat(
                $this->getFormatObject($this->getImageFormat()),
                quality: 80
            );

            $encoded->save(public_path($this->getImageAddress()));
            if ($encoded) {
                $indexArray[$sizeAlias] = $this->getImageAddress();
            } else {
                return false;
            }
        }
        $images['indexArray'] = $indexArray;
        $images['directory'] = $this->getFinalImageDirectory();
        $images['currentImage'] = Config::get('image.default-current-index-image');
        return $images;
    }

    public function deleteImage($imagePath)
    {
        $path = public_path($imagePath);

        if (file_exists($path)) {
            return unlink($path);
        }

        return false;
    }

    public function deleteIndex($images)
    {
        $directory = public_path($images['directory']);
        $this->deleteDirectoryAndFiles($directory);
    }
    public function deleteDirectoryAndFiles($directory)
    {
        if (!is_dir($directory)) {
            return false;
        }
        $files = glob($directory . DIRECTORY_SEPARATOR . '*', GLOB_MARK);
        // dd($files, $directory);
        foreach ($files as $file) {
            if (is_dir($file)) {
                $this->deleteDirectoryAndFiles($file);
            } else {
                unlink($file);
            }
        }
        $result = rmdir($directory);
        return $result;
    }
}
