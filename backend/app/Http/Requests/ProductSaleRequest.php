<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProductSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $saleId = $this->route('productsale') ? ($this->route('productsale')->id ?? $this->route('productsale')) : null;
        $isCreate = $this->isMethod('post');

        return [
            'name'           => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:150',
                Rule::unique('productsale', 'name')->ignore($saleId),
            ],
            'code'           => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('productsale', 'code')->ignore($saleId),
            ],
            'apply_to'       => [$isCreate ? 'required' : 'sometimes', 'in:order,product'],
            'product_id'     => ['nullable', 'integer', 'exists:products,id'],
            'pricesale'      => ['nullable', 'numeric', 'min:0'],
            'discount_type'  => ['nullable', 'in:percent,amount'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'max_discount'   => ['nullable', 'numeric', 'min:0'],
            'min_order'      => ['nullable', 'numeric', 'min:0'],
            'usage_limit'    => ['nullable', 'integer', 'min:1'],
            'used_count'     => ['nullable', 'integer', 'min:0'],
            'date_begin'     => [$isCreate ? 'required' : 'sometimes', 'date'],
            'date_end'       => [$isCreate ? 'required' : 'sometimes', 'date', 'after_or_equal:date_begin'],
            'status'         => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'Tên chương trình khuyến mãi không được để trống.',
            'name.unique'             => 'Tên chương trình khuyến mãi đã tồn tại.',
            'code.unique'             => 'Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác.',
            'apply_to.required'       => 'Vui lòng chọn loại áp dụng (Đơn hàng hoặc Sản phẩm).',
            'apply_to.in'             => 'Loại áp dụng chỉ nhận: order (đơn hàng) hoặc product (sản phẩm).',
            'discount_type.in'        => 'Loại giảm giá chỉ nhận: percent (%) hoặc amount (tiền cụ thể).',
            'discount_value.min'      => 'Mức giảm giá không được âm.',
            'min_order.min'           => 'Giá trị đơn tối thiểu không được âm.',
            'usage_limit.min'         => 'Số lần sử dụng tối đa phải từ 1 trở lên.',
            'date_begin.required'     => 'Vui lòng chọn ngày bắt đầu.',
            'date_end.required'       => 'Vui lòng chọn ngày kết thúc.',
            'date_end.after_or_equal' => 'Ngày kết thúc phải sau hoặc cùng ngày bắt đầu.',
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
