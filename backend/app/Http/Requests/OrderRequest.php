<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        if ($isCreate) {
            return [
                'user_id'            => ['nullable', 'integer', 'exists:users,id'],
                'name'               => ['required', 'string', 'max:255'],
                'phone'              => ['required', 'string', 'max:20'],
                'email'              => ['nullable', 'email', 'max:150'],
                'address'            => ['required', 'string', 'max:255'],
                'note'               => ['nullable', 'string'],
                'payment_method'     => ['nullable', 'string', 'max:30'],
                'payment_status'     => ['nullable', 'integer', 'in:0,1'],
                'coupon_code'        => ['nullable', 'string', 'max:50'],
                'discount_amount'    => ['nullable', 'numeric', 'min:0'],
                'shipping_fee'       => ['nullable', 'numeric', 'min:0'],
                'items'              => ['required', 'array', 'min:1'],
                'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
                'items.*.qty'        => ['required', 'integer', 'min:1'],
                'items.*.price'      => ['nullable', 'numeric', 'min:0'],
            ];
        }

        // Cập nhật trạng thái / thông tin đơn hàng (PUT / PATCH)
        return [
            'name'            => ['sometimes', 'string', 'max:255'],
            'phone'           => ['sometimes', 'string', 'max:20'],
            'email'           => ['nullable', 'email', 'max:150'],
            'address'         => ['sometimes', 'string', 'max:255'],
            'note'            => ['nullable', 'string'],
            'payment_method'  => ['nullable', 'string', 'max:30'],
            'payment_status'  => ['nullable', 'integer', 'in:0,1'],
            'status'          => ['nullable', 'integer', 'in:1,2,3,4,5'],
            'cancel_reason'   => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'               => 'Họ và tên người nhận không được để trống.',
            'name.max'                    => 'Họ và tên không vượt quá 255 ký tự.',
            'phone.required'              => 'Số điện thoại nhận hàng không được để trống.',
            'phone.max'                   => 'Số điện thoại không hợp lệ.',
            'email.email'                 => 'Địa chỉ email không đúng định dạng.',
            'address.required'            => 'Địa chỉ nhận hàng không được để trống.',
            'user_id.exists'              => 'Tài khoản người dùng không tồn tại.',
            'payment_status.in'           => 'Trạng thái thanh toán không hợp lệ (0: chưa thanh toán, 1: đã thanh toán).',
            'status.in'                   => 'Trạng thái đơn hàng không hợp lệ (1: Chờ xác nhận, 2: Đang xử lý, 3: Đang giao, 4: Đã giao, 5: Đã hủy).',
            'cancel_reason.max'           => 'Lý do hủy đơn không vượt quá 255 ký tự.',
            'items.required'              => 'Đơn hàng phải có ít nhất 1 sản phẩm.',
            'items.array'                 => 'Danh sách sản phẩm không hợp lệ.',
            'items.min'                   => 'Đơn hàng phải có ít nhất 1 sản phẩm.',
            'items.*.product_id.required' => 'Mã sản phẩm trong chi tiết đơn hàng không được để trống.',
            'items.*.product_id.exists'   => 'Có sản phẩm trong đơn hàng không tồn tại trên hệ thống.',
            'items.*.product_id.distinct' => 'Sản phẩm trong chi tiết đơn hàng bị trùng lặp, vui lòng gộp số lượng lại.',
            'items.*.qty.required'        => 'Số lượng sản phẩm không được để trống.',
            'items.*.qty.integer'         => 'Số lượng sản phẩm phải là số nguyên.',
            'items.*.qty.min'             => 'Số lượng từng sản phẩm phải từ 1 trở lên.',
            'items.*.price.numeric'       => 'Giá sản phẩm phải là số.',
            'items.*.price.min'           => 'Giá sản phẩm không được âm.',
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
