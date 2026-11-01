<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class SupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $supplierId = $this->route('supplier') ? ($this->route('supplier')->id ?? $this->route('supplier')) : $this->route('id');
        $isCreate = $this->isMethod('post') && empty($supplierId);

        return [
            'name'    => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:150',
                Rule::unique('suppliers', 'name')->ignore($supplierId)->whereNull('deleted_at'),
            ],
            'phone'   => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'status'  => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên nhà cung cấp không được để trống.',
            'name.max'      => 'Tên nhà cung cấp không vượt quá 150 ký tự.',
            'name.unique'   => 'Tên nhà cung cấp đã tồn tại.',
            'phone.max'     => 'Số điện thoại không vượt quá 20 ký tự.',
            'address.max'   => 'Địa chỉ không vượt quá 255 ký tự.',
            'status.in'     => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (hoạt động).',
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
