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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->integer('product_id');
            $table->integer('user_id');
            $table->tinyInteger('rating')->unsigned()->comment('1 đến 5 sao');
            $table->text('comment')->comment('Nội dung nhận xét đánh giá');
            $table->tinyInteger('status')->default(1)->comment('1: Hiển thị công khai, 0: Ẩn');
            $table->timestamps();

            // Khóa ngoại trỏ đến bảng products và users (onDelete cascade)
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Index để tăng tốc độ truy vấn
            $table->index(['product_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
