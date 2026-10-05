<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class PostTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $topicId = $this->route('post_topic') ? ($this->route('post_topic')->id ?? $this->route('post_topic')) : null;
        $isCreate = $this->isMethod('post');

        return [
            'name'        => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:150',
                Rule::unique('post_topics', 'name')->ignore($topicId)->whereNull('deleted_at'),
            ],
            'slug'        => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('post_topics', 'slug')->ignore($topicId)->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string'],
            'status'      => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên chủ đề bài viết không được để trống.',
            'name.max'      => 'Tên chủ đề bài viết không vượt quá 150 ký tự.',
            'name.unique'   => 'Tên chủ đề bài viết đã tồn tại.',
            'slug.unique'   => 'Slug chủ đề đã tồn tại.',
            'status.in'     => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (hiển thị).',
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
