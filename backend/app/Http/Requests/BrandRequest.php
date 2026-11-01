<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class BrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brandRoute = $this->route('brand') ?? $this->route('id');
        $brandId = is_object($brandRoute) ? ($brandRoute->id ?? null) : $brandRoute;
        $isCreate = empty($brandId);

        return [
            'name'        => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:150',
                Rule::unique('brands', 'name')->ignore($brandId)->whereNull('deleted_at'),
            ],
            'slug'        => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('brands', 'slug')->ignore($brandId)->whereNull('deleted_at'),
            ],
            'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048', new \App\Rules\UniqueImage('brands', 'image', $brandId)],
            'description' => ['nullable', 'string'],
            'status'      => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên thương hiệu không được để trống.',
            'name.max'      => 'Tên thương hiệu không vượt quá 150 ký tự.',
            'name.unique'   => 'Tên thương hiệu đã tồn tại.',
            'slug.unique'   => 'Slug thương hiệu đã tồn tại.',
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

