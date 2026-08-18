/**
 * dsh-theme-anime — 宿主侧插件（web profile 内的 loader 条目）。
 *
 * 职责：
 * 1. 让 cordis loader 能为该包创建 fiber（从而被 dsh-client-modules 扫描为
 *    web client 插件）；
 * 2. 提供 /theme/* 静态路由，把插件包 assets/ 里的图片（角色背景、立绘等）
 *    托管给浏览器端皮肤使用。
 */
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

export const name = "dsh-theme-anime";

const MIME = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".gif": "image/gif"
};

export function apply(ctx) {
	ctx.inject(["webServer"], (httpCtx) => {
		httpCtx.effect(() => {
			// assets 目录：本插件包下的 assets/（node_modules 内，随包分发）
			const here = fileURLToPath(new URL(".", import.meta.url));
			const assetsDir = join(here, "..", "assets");

			const dispose = httpCtx.webServer.register({
				kind: "prefix",
				path: "/theme",
				handler: (req, res) => {
					if (req.method !== "GET" && req.method !== "HEAD") {
						res.writeHead(405);
						res.end();
						return;
					}
					let pathname;
					try {
						pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
					} catch {
						pathname = "/";
					}
					// 只允许 /theme/<文件名>，拒绝路径穿越
					if (!pathname.startsWith("/theme/")) {
						res.writeHead(404);
						res.end();
						return;
					}
					const file = pathname.slice("/theme/".length);
					if (file.includes("/") || file.includes("\\") || file.includes("..")) {
						res.writeHead(404);
						res.end();
						return;
					}
					const full = join(assetsDir, file);
					if (!existsSync(full)) {
						res.writeHead(404);
						res.end();
						return;
					}
					const type = MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
					const body = readFileSync(full);
					res.writeHead(200, {
						"Content-Type": type,
						"Content-Length": String(body.length),
						"Cache-Control": "public, max-age=86400"
					});
					res.end(req.method === "HEAD" ? undefined : body);
				}
			});
			return () => {
				dispose();
			};
		}, "dsh-theme-anime: /theme asset route");
	});
}
