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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('advertisement_id')->nullable()->constrained('advertisements')->onDelete('cascade')->onUpdate('cascade');
            $table->string('amount');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            $table->text('authority')->nullable();
            $table->text('ref_id')->nullable();
            $table->text('card_pan')->nullable();
            $table->text('trace_no')->nullable();
            $table->text('gateway_response')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
