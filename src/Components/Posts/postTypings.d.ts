declare type e621Post = {
    "id": number,
    "created_at": string,
    "updated_at": string,
    "file": {
        "width": number,
        "height": number,
        "ext": "png" | "jpg" | "gif" | "webp" | "webm",
        "size": number,
        "md5": string,
        "url": string
    },
    "preview": {
        "width": number,
        "height": number,
        "url": string
    },
    "sample": {
        "has": boolean,
        "height": number,
        "width": number,
        "url": string,
        "alternates": {}
    },
    "score": {
        "up": number,
        "down": number,
        "total": number
    },
    "tags": {
        "general": string[],
        "species": string[],
        "character": string[],
        "copyright": string[],
        "artist": string[],
        "invalid": string[],
        "lore": string[],
        "meta": string[]
    },
    "locked_tags": string[],
    "change_seq": number,
    "flags": {
        "pending": boolean,
        "flagged": boolean,
        "note_locked": boolean,
        "status_locked": boolean,
        "rating_locked": boolean,
        "deleted": boolean
    },
    "rating": "s" | "q" | "e",
    "fav_count": number,
    "sources": string[],
    "pools": number[],
    "relationships": {
        "parent_id": number,
        "has_children": boolean,
        "has_active_children": boolean,
        "children": number[]
    },
    "approver_id": string | null,
    "uploader_id": number,
    "description": string,
    "comment_count": number,
    "is_favorited": boolean,
    "has_notes": boolean,
    "duration": null
}