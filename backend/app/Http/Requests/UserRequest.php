<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user') ? ($this->route('user')->id ?? $this->route('user')) : null;
        $isCreate = $this->isMethod('post');

        return [
            'name'     => [$isCreate ? 'required' : 'sometimes', 'string', 'max:100'],
            'email'    => [
                $isCreate ? 'required' : 'sometimes',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => [$isCreate ? 'required' : 'nullable', 'string', 'min:6'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'address'  => ['nullable', 'string', 'max:255'],
            'role'     => ['nullable', 'string', 'in:admin,customer'],
            'status'   => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Họ và tên không được để trống.',
            'name.max'          => 'Họ và tên không vượt quá 100 ký tự.',
            'email.required'    => 'Email không được để trống.',
            'email.email'       => 'Email không đúng định dạng.',
            'email.unique'      => 'Email này đã tồn tại trên hệ thống.',
            'email.max'         => 'Email không vượt quá 150 ký tự.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'phone.max'         => 'Số điện thoại không vượt quá 20 ký tự.',
            'address.max'       => 'Địa chỉ không vượt quá 255 ký tự.',
            'role.in'           => 'Vai trò không hợp lệ (admin hoặc customer).',
            'status.in'         => 'Trạng thái chỉ nhận giá trị 0 (vô hiệu) hoặc 1 (hoạt động).',
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
