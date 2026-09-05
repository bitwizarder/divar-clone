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
        Schema::create('advertisement_category_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advertisement_id')->constrained('advertisements')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('category_value_id')->constrained('category_values')->onDelete('cascade')->onUpdate('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisement_category_values');
    }
};
