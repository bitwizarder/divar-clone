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
        Schema::create('category_attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('unit');
            $table->tinyInteger('type')->default(0);

            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade')->onUpdate('cascade');


            $table->tinyInteger('status')->default(1)->comment('1 => enable , 0 => disable');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('_category__attributes');
    }
};
