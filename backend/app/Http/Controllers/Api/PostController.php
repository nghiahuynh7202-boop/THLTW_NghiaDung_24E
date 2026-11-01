<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * GET /api/posts hoặc GET /api/admin/posts — Danh sách bài viết
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Post::with(['topic', 'user'])->orderByDesc('created_at')->orderByDesc('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $posts = $query->paginate($perPage);

        return PostResource::collection($posts);
    }

    /**
     * POST /api/admin/posts — Thêm bài viết
     */
    public function store(PostRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Post::uniqueSlug($data['title']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create($data);

        return (new PostResource($post->load(['topic', 'user'])))
            ->additional(['message' => 'Thêm bài viết thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/posts/{id} hoặc GET /api/posts/{id} — Chi tiết bài viết
     */
    public function show($id): PostResource
    {
        $post = Post::with(['topic', 'user'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return new PostResource($post);
    }

    /**
     * PUT|PATCH /api/admin/posts/{post} — Cập nhật bài viết
     */
    public function update(PostRequest $request, Post $post): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && empty($data['slug'])) {
            $data['slug'] = Post::uniqueSlug($data['title'] ?? $post->title, $post->id);
        }

        if ($request->hasFile('image')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $data['image'] = $request->file('image')->store('posts', 'public');
        } else {
            unset($data['image']);
        }

        $post->update($data);

        return (new PostResource($post->load(['topic', 'user'])))
            ->additional(['message' => 'Cập nhật bài viết thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/posts/{post} — Xóa tạm bài viết (vào thùng rác)
     */
    public function destroy($id): JsonResponse
    {
        $post = $id instanceof Post ? $id : Post::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Xóa tạm bài viết thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/posts/trash — Danh sách bài viết trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);

        $posts = Post::onlyTrashed()
            ->with(['topic', 'user'])
            ->latest('deleted_at')
            ->paginate($perPage);

        return PostResource::collection($posts);
    }

    /**
     * PATCH /api/admin/posts/{id}/restore — Khôi phục bài viết từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $post = Post::onlyTrashed()->findOrFail($id);
        $post->restore();
        $post->update(['status' => 1]);

        return (new PostResource($post->load(['topic', 'user'])))
            ->additional(['message' => 'Khôi phục bài viết thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/posts/{id}/force — Xóa vĩnh viễn bài viết
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $post = Post::withTrashed()->findOrFail($id);

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn bài viết thành công.',
        ]);
    }
}
