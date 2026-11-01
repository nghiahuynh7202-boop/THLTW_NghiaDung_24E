<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bannerRoute = $this->route('banner') ?? $this->route('id');
        $bannerId = is_object($bannerRoute) ? ($bannerRoute->id ?? null) : $bannerRoute;
        $isCreate = empty($bannerId);

        return [
            'image'     => [
                $isCreate ? 'required' : 'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp,gif',
                'max:2048',
                new \App\Rules\UniqueImage('banners', 'image', $bannerId),
            ],
            'link'      => [
                'nullable',
                'string',
                'max:255',
            ],
            'order_num' => ['nullable', 'integer', 'min:0'],
            'status'    => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required'    => 'Hình ảnh banner không được để trống.',
            'image.image'       => 'Tập tin tải lên phải là hình ảnh.',
            'image.mimes'       => 'Hình ảnh phải có định dạng: jpeg, png, jpg, webp, gif.',
            'image.max'         => 'Dung lượng hình ảnh không được vượt quá 2MB.',
            'link.max'          => 'Đường dẫn liên kết không vượt quá 255 ký tự.',
            'order_num.integer' => 'Thứ tự hiển thị phải là số nguyên.',
            'order_num.min'     => 'Thứ tự hiển thị không được nhỏ hơn 0.',
            'status.in'         => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (hiển thị).',
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
