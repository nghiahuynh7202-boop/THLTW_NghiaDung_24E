<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bổ sung cột deleted_at cho các bảng cần hỗ trợ xóa mềm (SoftDeletes) và Thùng rác
     */
    public function up(): void
    {
        $tables = ['post_topics', 'pages', 'posts', 'menus', 'contacts'];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->softDeletes();
                });
            }
        }
    }

    /**
     * Hoàn tác khi rollback
     */
    public function down(): void
    {
        $tables = ['post_topics', 'pages', 'posts', 'menus', 'contacts'];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropSoftDeletes();
                });
            }
        }
    }
};
