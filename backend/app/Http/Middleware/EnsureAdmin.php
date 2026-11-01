<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Chỉ cho phép người dùng có role = 'admin' truy cập vào các API admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập vào khu vực quản trị.',
            ], 403);
        }

        return $next($request);
    }
}
