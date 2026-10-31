<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productRoute = $this->route('product') ?? $this->route('id');
        $productId = is_object($productRoute) ? ($productRoute->id ?? null) : $productRoute;
        $isCreate = $this->isMethod('post') && !$this->has('_method');

        return [
            'category_id' => [$isCreate ? 'required' : 'sometimes', 'integer', 'exists:categories,id'],
            'brand_id'    => ['nullable', 'integer', 'exists:brands,id'],
            'name'        => [
                $isCreate ? 'required' : 'sometimes',
                'string',
                'max:200',
                Rule::unique('products', 'name')->ignore($productId)->whereNull('deleted_at'),
            ],
            'slug'        => [
                'nullable',
                'string',
                'max:200',
                Rule::unique('products', 'slug')->ignore($productId)->whereNull('deleted_at'),
            ],
            'price'       => [$isCreate ? 'required' : 'sometimes', 'numeric', 'min:0'],
            'sale_price'  => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'qty'         => ['nullable', 'integer', 'min:0'],
            'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'description' => ['nullable', 'string'],
            // CHỨC NĂNG SẢN PHẨM NỔI BẬT: Xác thực cờ nổi bật chỉ nhận 0 (thường) hoặc 1 (nổi bật)
            'is_featured' => ['nullable', 'integer', 'in:0,1'],
            'status'      => ['nullable', 'integer', 'in:0,1'],
        ];
    }

    /**
     * Thông báo lỗi tùy chỉnh bằng tiếng Việt
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Danh mục không được để trống.',
            'category_id.exists'   => 'Danh mục đã chọn không hợp lệ.',
            'brand_id.exists'      => 'Thương hiệu đã chọn không hợp lệ.',
            'name.required'        => 'Tên sản phẩm không được để trống.',
            'name.max'             => 'Tên sản phẩm không vượt quá 200 ký tự.',
            'name.unique'          => 'Tên sản phẩm đã tồn tại, vui lòng đặt tên khác.',
            'slug.unique'          => 'Slug sản phẩm đã tồn tại.',
            'price.required'       => 'Giá sản phẩm không được để trống.',
            'price.numeric'        => 'Giá sản phẩm phải là số.',
            'price.min'            => 'Giá sản phẩm không được âm.',
            'sale_price.numeric'   => 'Giá sale phải là số.',
            'sale_price.min'       => 'Giá sale không được âm.',
            'sale_price.lt'        => 'Giá bán gốc phải cao hơn giá sale (giá sale phải nhỏ hơn giá bán).',
            'qty.integer'          => 'Số lượng phải là số nguyên.',
            'qty.min'              => 'Số lượng không được âm.',
            'image.image'          => 'File tải lên phải là hình ảnh.',
            'image.mimes'          => 'Hình ảnh phải có định dạng: jpeg, png, jpg, webp.',
            'image.max'            => 'Dung lượng hình ảnh không được quá 2MB.',
            'status.in'            => 'Trạng thái chỉ nhận giá trị 0 (ẩn) hoặc 1 (hiển thị).',
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

