import { DurableObject } from "cloudflare:workers";

const MAX_REQUEST_BYTES = 8192;
const MAX_NAME_LENGTH = 32;
const MAX_MESSAGE_LENGTH = 1000;
const COMMENT_LIST_LIMIT = 100;
const UUID_V4 = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;

function json(data, status = 200, headers = {}) {
	return Response.json(data, {
		status,
		headers: { "Cache-Control": "no-store", ...headers },
	});
}

async function readComment(request) {
	const reader = request.body?.getReader();
	if (!reader) return null;

	let size = 0;
	let body = "";
	const decoder = new TextDecoder();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > MAX_REQUEST_BYTES) {
			await reader.cancel();
			return null;
		}
		body += decoder.decode(value, { stream: true });
	}

	try {
		const input = JSON.parse(body + decoder.decode());
		const id = typeof input?.id === "string" && input.id.toLowerCase();
		const name = typeof input?.name === "string" && input.name.trim();
		const message = typeof input?.message === "string" && input.message.trim();
		if (!id || !UUID_V4.test(id) || !name || name.length > MAX_NAME_LENGTH ||
			!message || message.length > MAX_MESSAGE_LENGTH) return null;
		return { id, name, message };
	} catch {
		return null;
	}
}

export class PostComments extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.sql.exec(`CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY NOT NULL,
			name TEXT NOT NULL,
			message TEXT NOT NULL,
			createdAt INTEGER NOT NULL
		)`);
		this.sql.exec("CREATE INDEX IF NOT EXISTS comments_by_date ON comments (createdAt DESC, id DESC)");
	}

	list() {
		return this.sql.exec(
			"SELECT id, name, message, createdAt FROM comments ORDER BY createdAt DESC, id DESC LIMIT ?",
			COMMENT_LIST_LIMIT,
		).toArray();
	}

	add({ id, name, message }) {
		// 同一次提交可以重试。数据库按提交 ID 去重，避免连接中断后重复写入。
		this.sql.exec(
			"INSERT INTO comments (id, name, message, createdAt) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
			id, name, message, Date.now(),
		);
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname !== "/api/comments") return env.ASSETS.fetch(request);

		if (request.method !== "GET" && request.method !== "POST") {
			return json({ error: "method_not_allowed" }, 405, { Allow: "GET, POST" });
		}

		const post = url.searchParams.get("post");
		const segments = post?.split("/");
		if (!post || post.length > 240 || segments.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) {
			return json({ error: "invalid_post" }, 400);
		}

		try {
			const postPath = `/posts/${segments.map(encodeURIComponent).join("/")}/`;
			const article = await env.ASSETS.fetch(new URL(postPath, url), { method: "HEAD" });
			if (!article.ok) return json({ error: "post_not_found" }, 404);

			const comments = env.POST_COMMENTS.getByName(post);
			if (request.method === "GET") return json({ comments: await comments.list() });

			const origin = request.headers.get("Origin");
			if (origin && origin !== url.origin) return json({ error: "invalid_origin" }, 403);
			const contentType = request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
			if (contentType !== "application/json") return json({ error: "invalid_content_type" }, 415);

			// Cloudflare 在入口设置客户端 IP。限流键不写入评论存储。
			const key = request.headers.get("CF-Connecting-IP") || "unknown";
			const { success } = await env.COMMENT_POST_LIMIT.limit({ key });
			if (!success) return json({ error: "rate_limited" }, 429, { "Retry-After": "60" });

			const comment = await readComment(request);
			if (!comment) return json({ error: "invalid_comment" }, 400);
			await comments.add(comment);
			return json({ ok: true }, 201);
		} catch (error) {
			console.error("Comment request failed", error);
			return json({ error: "service_unavailable" }, 503);
		}
	},
};
