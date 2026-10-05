<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryRoute = $this->route('category') ?? $this->route('id');
        $categoryId = is_object($categoryRoute) ? ($categoryRoute->id ?? null) : $categoryRoute;
        $isCreate = $this->isMethod('post') && !$this->has('_method');

        return [
            'parent_id'   => ['nullable', 'integer'],
            'name'        => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:150',
                Rule::unique('categories', 'name')
                    ->ignore($categoryId)
                    ->where(fn ($query) => $query->where('status', '!=', 0)),
            ],
            'slug'        => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('categories', 'slug')
                    ->ignore($categoryId)
                    ->where(fn ($query) => $query->where('status', '!=', 0)),
            ],
            'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'is_featured' => ['nullable'],
            'status'      => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.max'      => 'Tên danh mục không vượt quá 150 ký tự.',
            'name.unique'   => 'Tên danh mục đã tồn tại, vui lòng đặt tên khác.',
            'slug.unique'   => 'Slug danh mục đã tồn tại.',
            'image.image'   => 'File tải lên phải là hình ảnh.',
            'image.mimes'   => 'Hình ảnh phải có định dạng: jpeg, png, jpg, webp.',
            'image.max'     => 'Dung lượng hình ảnh không được quá 2MB.',
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
