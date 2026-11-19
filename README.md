# SunnyHuang 的博客

基于 Astro 和 Fuwari 的个人博客，文章以 Markdown 管理，计划部署到 Cloudflare Workers。

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
- `src/content/posts/` 保存文章，当前欢迎文章是可修改的初始文案。

显示名使用英文名 SunnyHuang，简介和文章内容可以按自己的情况修改。文章授权提示已关闭，确定自己的文章授权方式后可在 `licenseConfig` 中设置。

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

## 部署到 Cloudflare Workers

1. 将本地代码提交并推送到 `https://github.com/Senanate/blog_web_Hsy` 的 `main` 分支。
2. 注册 Cloudflare，在 Workers & Pages 中创建应用并连接此 GitHub 仓库。
3. Worker 名称填写 `blog-web-hsy`，与 `wrangler.jsonc` 中的名称一致。
4. 构建命令填写 `pnpm build`，部署命令填写 `pnpm exec wrangler deploy`，根目录使用仓库根目录，生产分支选择 `main`。
5. 在构建环境变量中设置 `SITE_URL` 为 Cloudflare 实际提供的 HTTPS 地址，例如你的 `workers.dev` 地址，末尾加 `/`。Node.js 构建版本选择 24。
6. 部署成功后检查首页、文章、归档、关于、搜索、RSS 与 404。推送新提交会触发后续部署。

`SITE_URL` 决定 canonical、RSS、robots.txt 和 sitemap 的正式地址。本地缺省为 `http://localhost:4321/`，正式上线前必须设置为自己的实际网址。若首次部署后才得到网址，设置后重新构建部署。

本机也可以先设置环境变量、登录 Cloudflare，再直接部署。

```powershell
$env:SITE_URL = 'https://你的实际域名/'
corepack pnpm exec wrangler login
corepack pnpm deploy
```

## 自定义域名

购买域名后，将域名接入 Cloudflare 并按提示修改注册商的 NS。激活后，在 Worker 的 Settings → Domains & Routes 中添加 Custom Domain，等待证书生效。将构建环境中的 `SITE_URL` 改为正式域名并重新部署。

## 模板来源与许可

模板来源为 saicaca/fuwari，初始导入版本为 `6d39b0dec41282e7852e23e032998a5789abee28`。上游 MIT 许可保留于 `LICENSE`，页面底部保留 Astro 与 Fuwari 链接。

[Fuwari 源码](https://github.com/saicaca/fuwari) · [Cloudflare Astro 部署文档](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
