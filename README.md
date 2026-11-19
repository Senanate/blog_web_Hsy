# SunnyHuang 的博客

SunnyHuang 的个人博客，分享技术实践、学习笔记与生活思考。网站基于 Astro 和 Fuwari，文章以 Markdown 管理，已部署到 Cloudflare Workers。

- 访问线上网站。[SunnyHuang 的博客](https://blog-web-hsy.hshu96260.workers.dev/)
- 阅读第一篇技术分享。[使用 Astro、Fuwari 和 Cloudflare 发布我的个人博客](https://blog-web-hsy.hshu96260.workers.dev/posts/astro-fuwari-cloudflare-blog/)
- 查看文章源码。[博客搭建记录](src/content/posts/astro-fuwari-cloudflare-blog.md)

推送到 `main` 分支会触发 Cloudflare Workers Builds，依次构建静态页面、生成 Pagefind 搜索索引并部署。

## 本地开发

建议使用 Node.js 24 和项目声明的 pnpm 9.14.4。

```powershell
corepack pnpm install
corepack pnpm dev
```

浏览器打开 `http://localhost:4321/`。

```powershell
corepack pnpm check
corepack pnpm build
corepack pnpm preview
```

生产构建会生成 Pagefind 中文搜索索引。搜索功能请使用 `build` 后的 `preview` 验证，开发模式沿用主题的搜索演示提示。

## 修改个人信息

- `src/config.ts` 保存站点名称、语言、个人介绍、导航和社交链接。
- `src/content/spec/about.md` 保存关于页面。
- `public/avatar.jpg` 是微信头像，同时用作 favicon。
- `src/content/posts/` 保存文章，包含欢迎文章和博客搭建技术分享。

显示名使用英文名 SunnyHuang，简介和文章内容可以按自己的情况修改。文章授权提示已关闭，确定自己的文章授权方式后可在 `licenseConfig` 中设置。

页面布局由 `src/layouts/MainGridLayout.astro` 管理，侧边栏组件位于 `src/components/widget/`，全局样式入口为 `src/styles/global.css`。顶部横幅和导航可在 `src/config.ts` 中配置。

## 写文章

```powershell
corepack pnpm new-post my-next-post
```

编辑生成的 `src/content/posts/my-next-post.md`。

```yaml
---
title: 我的新文章
published: 2026-11-19
description: 一句话介绍这篇文章
tags: [学习笔记]
category: 学习
draft: false
---

从这里开始写正文。
```

`draft: true` 的文章只在开发模式显示，正式构建会排除草稿。文章使用 Markdown，代码块、数学公式、目录等能力沿用 Fuwari。

图片可以放进 `public/images/`，在 Markdown 中使用 `/images/文件名.jpg` 引用。准备发布时将 `draft` 改为 `false`，执行检查和构建，再提交文章及其使用的图片。

```powershell
corepack pnpm check
corepack pnpm build
git status
git add src/content/posts/
git commit -m "docs: publish a new post"
git push origin main
```

新增图片需额外 `git add` 对应的 `public/` 文件。可在 Cloudflare 的 Deployments 页面查看自动部署记录。

## 部署到 Cloudflare Workers

本站已经连接 GitHub 和 Cloudflare，当前部署参数如下。

| 配置项 | 当前值 |
| --- | --- |
| GitHub 仓库 | `Senanate/blog_web_Hsy` |
| 生产分支 | `main` |
| Worker 名称 | `blog-web-hsy` |
| Path／根目录 | `/` |
| 构建命令 | `pnpm build` |
| 部署命令 | `pnpm exec wrangler deploy` |
| 构建变量 `NODE_VERSION` | `24` |
| 构建变量 `SITE_URL` | `https://blog-web-hsy.hshu96260.workers.dev/` |

首次搭建时，在 Workers & Pages 创建应用并连接 GitHub 仓库。Worker 名称与 `wrangler.jsonc` 的 `name` 对齐，构建变量在 Settings 的 Build／Builds 下配置。首次部署后进入 Domains 查看 Production 对应的 `workers.dev` 地址，并启用该行开关。

复用此项目时，填写自己的 GitHub 仓库、Worker 名称与实际域名。修改构建变量后重新触发部署，检查首页、文章、关于、搜索、RSS、站点地图和 404。

`SITE_URL` 决定 canonical、RSS、robots.txt 和 sitemap 的正式地址。`astro.config.mjs` 默认使用本站当前的公网地址，也支持通过构建环境变量覆盖。开发预览仍在本地地址打开，默认是 `http://localhost:4321/`。

本机也可以先设置环境变量、登录 Cloudflare，再直接部署。

```powershell
$env:SITE_URL = 'https://blog-web-hsy.hshu96260.workers.dev/'
corepack pnpm exec wrangler login
corepack pnpm deploy
```

## 自定义域名

当前使用 Cloudflare 提供的 `workers.dev` 域名。以后购买自定义域名后，将域名接入 Cloudflare 并按提示修改注册商的 NS。激活后，在 Worker 的 Domains 页面添加自定义域名，等待证书生效。将构建环境中的 `SITE_URL` 改为正式域名并重新部署。

## 模板来源与许可

模板来源为 saicaca/fuwari，初始导入版本为 `6d39b0dec41282e7852e23e032998a5789abee28`。上游 MIT 许可保留于 `LICENSE`，页面底部保留 Astro 与 Fuwari 链接。

[Fuwari 源码](https://github.com/saicaca/fuwari) · [Cloudflare Astro 部署文档](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
