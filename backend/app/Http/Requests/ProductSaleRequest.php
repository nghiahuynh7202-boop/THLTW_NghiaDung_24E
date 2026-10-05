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
            'apply_to'       => [$isCreate ? 'required' : 'sometimes', 'in:product,order'],
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
            'name.required'                => 'Tên chương trình khuyến mãi không được để trống.',
            'name.max'                     => 'Tên chương trình khuyến mãi không vượt quá 150 ký tự.',
            'name.unique'                  => 'Tên chương trình khuyến mãi đã tồn tại, vui lòng chọn tên khác.',
            'code.max'                     => 'Mã khuyến mãi không vượt quá 50 ký tự.',
            'code.unique'                  => 'Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác.',
            'apply_to.required'            => 'Loại áp dụng không được để trống.',
            'apply_to.in'                  => 'Loại áp dụng chỉ nhận giá trị: product (sản phẩm) hoặc order (đơn hàng).',
            'product_id.exists'            => 'Sản phẩm áp dụng khuyến mãi không tồn tại.',
            'pricesale.numeric'            => 'Giá khuyến mãi phải là số.',
            'pricesale.min'                => 'Giá khuyến mãi không được âm.',
            'discount_type.in'             => 'Loại giảm giá chỉ nhận giá trị: percent (%) hoặc amount (tiền cụ thể).',
            'discount_value.numeric'       => 'Giá trị giảm giá phải là số.',
            'discount_value.min'           => 'Giá trị giảm giá không được âm.',
            'max_discount.numeric'         => 'Mức giảm giá tối đa phải là số.',
            'max_discount.min'             => 'Mức giảm giá tối đa không được âm.',
            'min_order.numeric'            => 'Giá trị đơn hàng tối thiểu phải là số.',
            'min_order.min'                => 'Giá trị đơn hàng tối thiểu không được âm.',
            'usage_limit.integer'          => 'Giới hạn số lần sử dụng phải là số nguyên.',
            'usage_limit.min'              => 'Giới hạn số lần sử dụng phải lớn hơn 0.',
            'used_count.integer'           => 'Số lượt đã sử dụng phải là số nguyên.',
            'used_count.min'               => 'Số lượt đã sử dụng không được âm.',
            'date_begin.required'          => 'Ngày bắt đầu khuyến mãi không được để trống.',
            'date_begin.date'              => 'Ngày bắt đầu không đúng định dạng ngày giờ.',
            'date_end.required'            => 'Ngày kết thúc khuyến mãi không được để trống.',
            'date_end.date'                => 'Ngày kết thúc không đúng định dạng ngày giờ.',
            'date_end.after_or_equal'      => 'Ngày kết thúc phải diễn ra sau hoặc cùng ngày bắt đầu.',
            'status.in'                    => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (áp dụng).',
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
