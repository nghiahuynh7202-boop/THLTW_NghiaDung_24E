<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class MenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'name'      => [$isCreate ? 'required' : 'sometimes', 'string', 'max:150'],
            'link'      => [$isCreate ? 'required' : 'sometimes', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer'],
            'order_num' => ['nullable', 'integer', 'min:0'],
            'status'    => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên menu không được để trống.',
            'name.max'      => 'Tên menu không vượt quá 150 ký tự.',
            'link.required' => 'Liên kết menu không được để trống.',
            'link.max'      => 'Liên kết menu không vượt quá 255 ký tự.',
            'order_num.min' => 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0.',
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
