<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('ads_type')->nullable()->comment('مثلا بازی');
            $table->string('ads_status')->default('as_good_as_new')->comment('درحد نو یا نو');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('state_id')->nullable()->constrained('states')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->tinyInteger('status')->default(1)->comment('1 => enable , 0 => disable , 2 => active , 3 => pending , 4 => expire',);
            $table->dateTime('published_at')->nullable();
            $table->dateTime('expired_at')->nullable();
            $table->unsignedBigInteger('view')->default(0);
            $table->string('contact')->nullable();
            $table->tinyInteger('is_special')->default(0);
            $table->tinyInteger('is_ladder')->default(0);
            $table->text('image')->nullable();
            $table->string('slug')->nullable();
            $table->unsignedBigInteger('price')->nullable();
            $table->text('tags')->nullable();
            $table->string('lat')->nullable();
            $table->string('lng')->nullable();
            $table->tinyInteger('willing_to_trade')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
