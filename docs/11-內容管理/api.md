# 內容管理 API

## 需要的 API

### GET /api/admin/courses

管理員取得課程列表。

### POST /api/admin/courses

建立課程。

### PATCH /api/admin/courses/{course_id}

更新課程。

### POST /api/admin/courses/{course_id}/publish

發布課程。

### POST /api/admin/courses/{course_id}/unpublish

下架課程。

### POST /api/admin/media-assets

上傳媒體資源。

## 權限

- 僅管理員與內容編輯可以進入。
- 發布與下架可依角色再細分權限。
