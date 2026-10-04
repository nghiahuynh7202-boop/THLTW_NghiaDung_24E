<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StockDocumentItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'document_id' => [$isCreate ? 'required' : 'sometimes', 'integer', 'exists:stock_documents,id'],
            'product_id'  => [$isCreate ? 'required' : 'sometimes', 'integer', 'exists:products,id'],
            'qty'         => [$isCreate ? 'required' : 'sometimes', 'integer', 'min:1'],
            'unit_cost'   => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'document_id.required' => 'Mã phiếu kho không được để trống.',
            'document_id.exists'   => 'Phiếu kho không tồn tại.',
            'product_id.required'  => 'Mã sản phẩm không được để trống.',
            'product_id.exists'    => 'Sản phẩm không tồn tại.',
            'qty.required'         => 'Số lượng không được để trống.',
            'qty.integer'          => 'Số lượng phải là số nguyên.',
            'qty.min'              => 'Số lượng phải lớn hơn 0.',
            'unit_cost.integer'    => 'Đơn giá phải là số nguyên.',
            'unit_cost.min'        => 'Đơn giá không được âm.',
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
