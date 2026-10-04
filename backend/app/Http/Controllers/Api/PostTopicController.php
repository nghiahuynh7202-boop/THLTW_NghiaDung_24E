<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostTopicRequest;
use App\Http\Resources\PostTopicResource;
use App\Models\PostTopic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostTopicController extends Controller
{
    /**
     * GET /api/post-topics hoặc GET /api/admin/post-topics — Danh sách chủ đề bài viết
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = PostTopic::withCount('posts')->latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $topics = $query->paginate($perPage);

        return PostTopicResource::collection($topics);
    }

    /**
     * POST /api/admin/post-topics — Thêm chủ đề bài viết
     */
    public function store(PostTopicRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? PostTopic::uniqueSlug($data['name']);

        $topic = PostTopic::create($data);

        return (new PostTopicResource($topic))
            ->additional(['message' => 'Thêm chủ đề bài viết thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/post-topics/{id} hoặc GET /api/post-topics/{id} — Chi tiết chủ đề
     */
    public function show($id): PostTopicResource
    {
        $topic = PostTopic::withCount('posts')->findOrFail($id);

        return new PostTopicResource($topic);
    }

    /**
     * PUT|PATCH /api/admin/post-topics/{post_topic} — Cập nhật chủ đề
     */
    public function update(PostTopicRequest $request, PostTopic $postTopic): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && empty($data['slug'])) {
            $data['slug'] = PostTopic::uniqueSlug($data['name'] ?? $postTopic->name, $postTopic->id);
        }

        $postTopic->update($data);

        return (new PostTopicResource($postTopic))
            ->additional(['message' => 'Cập nhật chủ đề bài viết thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/post-topics/{post_topic} — Xóa tạm chủ đề
     */
    public function destroy(PostTopic $postTopic): JsonResponse
    {
        $postTopic->update(['status' => 0]);
        $postTopic->delete();

        return response()->json([
            'message' => 'Xóa tạm chủ đề bài viết thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/post-topics/trash — Danh sách chủ đề trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $topics = PostTopic::onlyTrashed()
            ->latest('deleted_at')
            ->paginate($perPage);

        return PostTopicResource::collection($topics);
    }

    /**
     * PATCH /api/admin/post-topics/{id}/restore — Khôi phục chủ đề từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $topic = PostTopic::onlyTrashed()->findOrFail($id);
        $topic->restore();

        return (new PostTopicResource($topic))
            ->additional(['message' => 'Khôi phục chủ đề bài viết thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/post-topics/{id}/force — Xóa vĩnh viễn chủ đề
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $topic = PostTopic::withTrashed()->findOrFail($id);
        $topic->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn chủ đề bài viết thành công.',
        ]);
    }
}
