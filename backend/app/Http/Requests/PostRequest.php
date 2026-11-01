<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class PostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $postId = $this->route('post') ? ($this->route('post')->id ?? $this->route('post')) : null;
        $isCreate = $this->isMethod('post');

        $hasDeletedAt = false;
        try {
            $hasDeletedAt = \Illuminate\Support\Facades\Schema::hasColumn('posts', 'deleted_at');
        } catch (\Throwable $e) {
            $hasDeletedAt = false;
        }

        $titleRule = Rule::unique('posts', 'title')->ignore($postId);
        $slugRule = Rule::unique('posts', 'slug')->ignore($postId);
        if ($hasDeletedAt) {
            $titleRule = $titleRule->whereNull('deleted_at');
            $slugRule = $slugRule->whereNull('deleted_at');
        }

        return [
            'user_id'  => ['nullable', 'integer', 'exists:users,id'],
            'topic_id' => ['nullable', 'integer', 'exists:post_topics,id'],
            'title'    => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:255',
                $titleRule,
            ],
            'slug'     => [
                'nullable',
                'string',
                'max:255',
                $slugRule,
            ],
            'image'    => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048', new \App\Rules\UniqueImage('posts', 'image', $postId)],
            'summary'  => ['nullable', 'string', 'max:500'],
            'content'  => [$isCreate ? 'required' : 'sometimes', 'string'],
            'status'   => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'Tiêu đề bài viết không được để trống.',
            'title.max'        => 'Tiêu đề bài viết không vượt quá 255 ký tự.',
            'title.unique'     => 'Tiêu đề bài viết đã tồn tại.',
            'slug.unique'      => 'Slug bài viết đã tồn tại.',
            'content.required' => 'Nội dung bài viết không được để trống.',
            'topic_id.exists'  => 'Chủ đề bài viết không hợp lệ.',
            'user_id.exists'   => 'Tác giả không hợp lệ.',
            'image.image'      => 'File tải lên phải là hình ảnh.',
            'image.mimes'      => 'Hình ảnh phải có định dạng: jpeg, png, jpg, webp.',
            'image.max'        => 'Dung lượng hình ảnh không được quá 2MB.',
            'summary.max'      => 'Tóm tắt bài viết không vượt quá 500 ký tự.',
            'status.in'        => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (hiển thị).',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'message' => $validator->errors()->first(),
            'errors'  => $validator->errors(),
        ], 422));
    }
}
