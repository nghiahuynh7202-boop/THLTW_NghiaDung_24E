<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pageId = $this->route('page') ? ($this->route('page')->id ?? $this->route('page')) : null;
        $isCreate = $this->isMethod('post');

        return [
            'title'   => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:255',
                Rule::unique('pages', 'title')->ignore($pageId)->whereNull('deleted_at'),
            ],
            'slug'    => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('pages', 'slug')->ignore($pageId)->whereNull('deleted_at'),
            ],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => [$isCreate ? 'required' : 'sometimes', 'string'],
            'status'  => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'Tiêu đề trang không được để trống.',
            'title.max'        => 'Tiêu đề trang không vượt quá 255 ký tự.',
            'title.unique'     => 'Tiêu đề trang đã tồn tại.',
            'slug.unique'      => 'Slug trang đã tồn tại.',
            'content.required' => 'Nội dung trang không được để trống.',
            'summary.max'      => 'Tóm tắt trang không vượt quá 500 ký tự.',
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
