<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StockDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $documentId = $this->route('stock_document') ? ($this->route('stock_document')->id ?? $this->route('stock_document')) : null;
        $isCreate = $this->isMethod('post');

        return [
            'code'               => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('stock_documents', 'code')->ignore($documentId)->whereNull('deleted_at'),
            ],
            'type'               => [$isCreate ? 'required' : 'sometimes', 'string', 'in:in,out'],
            'reason'             => [$isCreate ? 'required' : 'sometimes', 'string', 'max:100'],
            'supplier_id'        => ['nullable', 'integer', 'exists:suppliers,id'],
            'note'               => ['nullable', 'string'],
            'created_by'         => ['nullable', 'integer', 'exists:users,id'],
            'items'              => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
            'items.*.qty'        => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_cost'  => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique'                => 'Mã phiếu kho đã tồn tại.',
            'type.required'              => 'Loại phiếu kho không được để trống (in hoặc out).',
            'type.in'                    => 'Loại phiếu kho chỉ nhận giá trị in (nhập kho) hoặc out (xuất kho).',
            'reason.required'            => 'Lý do nhập/xuất kho không được để trống.',
            'reason.max'                 => 'Lý do không vượt quá 100 ký tự.',
            'supplier_id.exists'         => 'Nhà cung cấp không hợp lệ.',
            'created_by.exists'          => 'Người tạo phiếu không hợp lệ.',
            'items.array'                => 'Danh sách sản phẩm phải là một mảng.',
            'items.*.product_id.exists'  => 'Sản phẩm trong phiếu không tồn tại.',
            'items.*.qty.min'            => 'Số lượng sản phẩm trong phiếu phải lớn hơn 0.',
            'items.*.unit_cost.min'      => 'Đơn giá không được âm.',
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
