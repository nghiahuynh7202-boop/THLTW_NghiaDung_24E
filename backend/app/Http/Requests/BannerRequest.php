<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'image'     => [$isCreate ? 'required' : 'nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:2048'],
            'link'      => ['nullable', 'string', 'max:255'],
            'order_num' => ['nullable', 'integer', 'min:0'],
            'status'    => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Hình ảnh banner không được để trống.',
            'image.image'    => 'File tải lên phải là hình ảnh.',
            'image.mimes'    => 'Hình ảnh phải có định dạng: jpeg, png, jpg, webp, gif.',
            'image.max'      => 'Dung lượng hình ảnh không được quá 2MB.',
            'link.max'       => 'Liên kết không vượt quá 255 ký tự.',
            'order_num.min'  => 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0.',
            'status.in'      => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (hiển thị).',
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
