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
        Schema::create('category_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_attribute_id')->nullable()->constrained('category_attributes')->onDelete('cascade')->onUpdate('cascade');
            $table->text('value');
            $table->tinyInteger('type')->default(0);
 
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
        Schema::dropIfExists('category_values');
    }
};
