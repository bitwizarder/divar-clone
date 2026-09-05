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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('url')->nullable();
            $table->string('icon')->nullable();
            $table->string('position');
            $table->foreignId('parent_id')->nullable()->constrained('menus')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('menus');
    }
};
