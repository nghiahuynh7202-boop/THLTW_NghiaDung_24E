<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $hasConfirmation = $this->has('password_confirmation');

        return [
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => array_filter([
                'required',
                'string',
                'min:6',
                $hasConfirmation ? 'confirmed' : null,
            ]),
            'phone'    => ['nullable', 'string', 'max:20'],
            'address'  => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'Họ và tên không được để trống.',
            'name.max'           => 'Họ và tên không vượt quá 100 ký tự.',
            'email.required'     => 'Email không được để trống.',
            'email.email'        => 'Email không đúng định dạng.',
            'email.unique'       => 'Email này đã được đăng ký tài khoản.',
            'email.max'          => 'Email không vượt quá 150 ký tự.',
            'password.required'  => 'Mật khẩu không được để trống.',
            'password.min'       => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'phone.max'          => 'Số điện thoại không vượt quá 20 ký tự.',
            'address.max'        => 'Địa chỉ không vượt quá 255 ký tự.',
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
