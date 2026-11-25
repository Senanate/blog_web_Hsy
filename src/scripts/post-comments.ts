interface CommentEntry {
	id: string;
	name: string;
	message: string;
	createdAt: number;
}

const dateFormat = new Intl.DateTimeFormat("zh-CN", {
	dateStyle: "medium",
	timeStyle: "short",
});

class BlogComments extends HTMLElement {
	#connection?: AbortController;

	connectedCallback() {
		const url = this.dataset.url;
		const form = this.querySelector("form");
		const button = form?.querySelector("button");
		const list = this.querySelector("ol");
		const template = this.querySelector("template");
		const listStatus = this.querySelector("[data-list-status]");
		const formStatus = this.querySelector("[data-form-status]");
		if (!url || !form || !button || !list || !template || !listStatus || !formStatus) return;

		// Swup 切换文章时会替换正文。取消旧页面的请求与事件监听。
		const { signal } = (this.#connection = new AbortController());
		const requestSignal = () => AbortSignal.any([signal, AbortSignal.timeout(10_000)]);

		const loadComments = async () => {
			listStatus.textContent = "正在加载评论…";
			try {
				const response = await fetch(url, { signal: requestSignal() });
				if (!response.ok) throw new Error("Comment list unavailable");
				const { comments }: { comments: CommentEntry[] } = await response.json();
				if (signal.aborted) return;
				const rows = comments.map((comment) => {
					const row = template.content.cloneNode(true) as DocumentFragment;
					const date = new Date(comment.createdAt);
					const time = row.querySelector("time")!;
					row.querySelector("strong")!.textContent = comment.name;
					row.querySelector("p")!.textContent = comment.message;
					time.dateTime = date.toISOString();
					time.textContent = dateFormat.format(date);
					return row;
				});
				list.replaceChildren(...rows);
				listStatus.textContent = rows.length ? "" : "还没有评论，欢迎留言。";
			} catch {
				if (!signal.aborted) listStatus.textContent = "评论加载失败，请刷新页面重试。";
			}
		};

		let submission: { id: string; name: string; message: string } | undefined;
		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			if (button.disabled) return;
			const fields = new FormData(form);
			const name = String(fields.get("name") ?? "").trim();
			const message = String(fields.get("message") ?? "").trim();
			if (!name || !message) {
				formStatus.textContent = "请填写昵称和评论内容。";
				return;
			}
			if (!submission || submission.name !== name || submission.message !== message) {
				submission = { id: crypto.randomUUID(), name, message };
			}
			button.disabled = true;
			formStatus.textContent = "正在提交…";
			try {
				const response = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(submission),
					signal: requestSignal(),
				});
				if (signal.aborted) return;
				if (response.status === 429) {
					formStatus.textContent = "提交太频繁，请稍后重试。";
					return;
				}
				if (!response.ok) throw new Error("Comment submission failed");
				// 网络请求期间仍可编辑表单，保留在此期间输入的新内容。
				const current = new FormData(form);
				if (current.get("name") === fields.get("name") && current.get("message") === fields.get("message")) {
					form.reset();
				}
				submission = undefined;
				formStatus.textContent = "评论已发布。";
				await loadComments();
			} catch {
				if (!signal.aborted) formStatus.textContent = "评论提交失败，请稍后重试。";
			} finally {
				if (!signal.aborted) button.disabled = false;
			}
		}, { signal });

		button.disabled = true;
		void loadComments().finally(() => {
			if (!signal.aborted) button.disabled = false;
		});
	}

	disconnectedCallback() {
		this.#connection?.abort();
	}
}

customElements.define("blog-comments", BlogComments);
