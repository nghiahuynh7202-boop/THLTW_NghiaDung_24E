<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class UniqueImage implements ValidationRule
{
    protected string $table;
    protected string $column;
    protected mixed $ignoreId;
    protected ?string $customMessage;

    public function __construct(
        string $table = 'products',
        string $column = 'image',
        mixed $ignoreId = null,
        ?string $customMessage = null
    ) {
        $this->table = $table;
        $this->column = $column;
        $this->ignoreId = $ignoreId;
        $this->customMessage = $customMessage;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! ($value instanceof UploadedFile) || ! $value->isValid()) {
            return;
        }

        $uploadedPath = $value->getRealPath();
        if (! $uploadedPath || ! file_exists($uploadedPath)) {
            return;
        }

        $uploadedSize = $value->getSize();
        $uploadedHash = md5_file($uploadedPath);
        if (! $uploadedHash) {
            return;
        }

        // Lấy danh sách ảnh hiện có trong cơ sở dữ liệu
        $query = DB::table($this->table)->whereNotNull($this->column);

        if ($this->ignoreId) {
            $query->where('id', '!=', $this->ignoreId);
        }

        if (Schema::hasColumn($this->table, 'deleted_at')) {
            $query->whereNull('deleted_at');
        }

        $existingImages = $query->pluck($this->column);

        foreach ($existingImages as $imagePath) {
            if (empty($imagePath)) {
                continue;
            }

            $fullPath = Storage::disk('public')->path($imagePath);
            if (! file_exists($fullPath) || ! is_file($fullPath)) {
                continue;
            }

            // Tối ưu hiệu năng: So sánh kích thước file trước, nếu bằng nhau mới so hash MD5
            if (filesize($fullPath) === $uploadedSize) {
                if (md5_file($fullPath) === $uploadedHash) {
                    $message = $this->customMessage ?? 'Hình ảnh này đã tồn tại trong cơ sở dữ liệu, vui lòng chọn hình ảnh khác.';
                    $fail($message);
                    return;
                }
            }
        }
    }
}
