<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'product_id' => [$isCreate ? 'required' : 'sometimes', 'integer', 'exists:products,id'],
            'qty'        => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Vui lòng chọn sản phẩm cần thêm vào giỏ hàng.',
            'product_id.exists'   => 'Sản phẩm không tồn tại trong hệ thống.',
            'qty.required'        => 'Số lượng không được để trống.',
            'qty.integer'         => 'Số lượng phải là số nguyên.',
            'qty.min'             => 'Số lượng phải lớn hơn hoặc bằng 1.',
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
