<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name'    => [$isCreate ? 'required' : 'sometimes', 'string', 'max:100'],
            'phone'   => [$isCreate ? 'required' : 'sometimes', 'string', 'regex:/^[0-9\-\+\(\)\s]{9,20}$/', 'max:20'],
            'email'   => ['nullable', 'email', 'max:150'],
            'message' => [$isCreate ? 'required' : 'sometimes', 'string', 'max:2000'],
            'reply'   => ['nullable', 'string', 'max:2000'],
            'status'  => ['nullable', 'string', 'in:chua_xem,da_xem,da_tra_loi'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Họ tên không được để trống.',
            'name.max'         => 'Họ tên không vượt quá 100 ký tự.',
            'phone.required'   => 'Số điện thoại không được để trống.',
            'phone.regex'      => 'Số điện thoại không đúng định dạng.',
            'phone.max'        => 'Số điện thoại không vượt quá 20 ký tự.',
            'email.email'      => 'Email không đúng định dạng.',
            'email.max'        => 'Email không vượt quá 150 ký tự.',
            'message.required' => 'Nội dung liên hệ không được để trống.',
            'message.max'      => 'Nội dung không vượt quá 2000 ký tự.',
            'reply.max'        => 'Nội dung phản hồi không vượt quá 2000 ký tự.',
            'user_id.exists'   => 'Tài khoản người dùng không tồn tại.',
            'status.in'        => 'Trạng thái liên hệ không hợp lệ (chua_xem, da_xem, da_tra_loi).',
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
