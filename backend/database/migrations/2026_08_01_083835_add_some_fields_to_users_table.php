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
        Schema::table('users', function (Blueprint $table) {
            $table->string('mobile')->nullable()->after('email_verified_at')->unique();
            $table->dateTime('mobile_verified_at')->nullable()->after('mobile');
            $table->foreignId('city_id')->nullable()->after('mobile_verified_at')->constrained('cities')->onDelete('cascade')->onUpdate('cascade');
            $table->tinyInteger('is_active')->default(0)->comment('0 => disable , 1 => enable');
            $table->tinyInteger('user_type')->default(0)->comment('0 => user , 1 => admin');
            $table->tinyInteger('status')->default(1)->comment('0 => disable , 1 => enable');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
