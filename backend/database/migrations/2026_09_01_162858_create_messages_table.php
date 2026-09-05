<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('body')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();


            $table->index(['conversation_id', 'sent_at']);
            $table->index(['conversation_id', 'sender_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
