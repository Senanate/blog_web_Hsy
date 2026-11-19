---
title: "使用 Astro、Fuwari 和 Cloudflare 发布我的个人博客"
published: 2026-11-19T23:05:41+08:00
description: "记录 SunnyHuang 博客从导入 Fuwari 模板、配置个人信息，到连接 GitHub、部署 Cloudflare Workers 和设置正式网址的完整过程。"
tags: [Astro, Fuwari, GitHub, Cloudflare, 博客搭建]
category: 技术分享
draft: false
---

我的个人博客已经上线了。这篇文章记录从准备模板到发布网站的过程，包括自己在 Cloudflare 控制台里需要填写的配置，以及后续怎样更新文章。

博客的源代码保存在自己的 GitHub 仓库中，网页由 Cloudflare Workers 托管。

- 访问网站。[SunnyHuang 的博客](https://blog-web-hsy.hshu96260.workers.dev/)
- 查看代码。[博客 GitHub 仓库](https://github.com/Senanate/blog_web_Hsy)

## 这次使用的技术和工具

| 工具 | 在博客中的作用 |
| --- | --- |
| Astro | 把页面和文章构建成静态网站 |
| Fuwari | 提供博客布局、主题切换、分类、标签和目录等功能 |
| Markdown | 编写和保存文章正文 |
| Pagefind | 在生产构建时生成站内搜索索引 |
| GitHub | 保存代码、文章和修改记录 |
| Cloudflare Workers | 托管静态文件，并在 GitHub 推送后自动部署 |

本地环境使用 Node.js 24，项目声明的包管理器是 pnpm 9.14.4。文章中的命令以 Windows PowerShell 为例。

## 准备自己的仓库并导入模板

我先在 GitHub 创建了自己的仓库 `Senanate/blog_web_Hsy`，再把 Fuwari 模板源码导入本地项目。模板使用 MIT 许可，项目保留了原作者的 `LICENSE` 和页脚署名。

如果从一个新建的空仓库开始复现，可以这样导入。执行前把仓库地址替换成自己的地址，并选择合适的本地目录。

```powershell
git clone https://github.com/Senanate/blog_web_Hsy.git blog_web
cd blog_web
git fetch https://github.com/saicaca/fuwari.git main --depth=1
git archive --format=tar --output=fuwari-template.tar FETCH_HEAD
tar -xf fuwari-template.tar
Remove-Item -LiteralPath .\fuwari-template.tar
```

这组命令适用于自己的空仓库。本文对应的仓库已经包含完整博客，直接克隆后就可以安装依赖和预览。

模板的配置和文章格式可以在上游仓库中查阅。[Fuwari 模板](https://github.com/saicaca/fuwari)

## 安装依赖并在本地预览

在项目目录执行下面的命令。

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

浏览器打开终端给出的地址，默认是 `http://localhost:4321/`。修改文件并保存后，开发服务器会更新页面。

项目已经安装好依赖时，也可以使用 `npm run dev` 启动预览。

## 配置个人信息和文章

个人信息主要集中在 `src/config.ts`。我把站点名称改为“SunnyHuang 的博客”，语言设为 `zh_CN`，显示名改为自己的英文名 SunnyHuang，并把个人链接指向自己的 GitHub。

微信头像保存为 `public/avatar.jpg`，配置中通过 `/avatar.jpg` 引用，同时用作网站图标。

| 文件 | 内容 |
| --- | --- |
| `src/config.ts` | 站点名称、简介、头像、导航和主题设置 |
| `src/content/spec/about.md` | 关于页面 |
| `src/content/posts/` | Markdown 文章 |
| `public/` | 图片等静态资源 |

新文章可以通过命令生成。

```powershell
corepack pnpm new-post my-next-post
```

生成的 Markdown 文件开头包含标题、日期、简介、标签、分类和草稿状态。正文写在第二个 `---` 后面。`draft: true` 的文章会显示在本地开发模式中，准备发布时改成 `draft: false`。

## 准备静态构建和部署配置

博客使用 Astro 的静态输出模式。`astro.config.mjs` 中设置 `output: "static"`，`site` 使用正式网站地址，并支持通过构建环境变量 `SITE_URL` 覆盖。

项目根目录的 `wrangler.jsonc` 配置如下。

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "blog-web-hsy",
  "compatibility_date": "2026-11-19",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

其中 `assets.directory` 指向 Astro 的构建产物 `dist`，`not_found_handling` 让不存在的页面使用项目生成的 404 页面。`compatibility_date` 是本文搭建时使用的日期。

本地执行检查和构建。

```powershell
corepack pnpm check
corepack pnpm build
corepack pnpm preview
```

项目的 `build` 命令会依次运行 `astro build` 和 `pagefind --site dist`，所以会同时生成网页与搜索索引。验证搜索功能时，我使用构建后的预览页面。

静态 Astro 站点的部署配置可参考官方指南。[Cloudflare 的 Astro 部署文档](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)

## 提交代码并连接 Cloudflare

完成本地修改后，我先把代码提交到自己的 GitHub 仓库。

```powershell
git status
git add .
git commit -m "feat: initialize personal blog"
git push -u origin main
```

项目的 `.gitignore` 已配置依赖目录、构建产物和本地环境文件。提交前通过 `git status` 核对本次修改。

注册 Cloudflare 账号后，在控制台进入 Workers & Pages，创建应用并选择连接 GitHub，授权访问博客仓库。选中 `Senanate/blog_web_Hsy` 后，填写下面的配置。

| 配置项 | 本站使用的值 |
| --- | --- |
| Worker 名称 | `blog-web-hsy` |
| 生产分支 | `main` |
| Path／根目录 | `/`，即仓库根目录 |
| Build command | `pnpm build` |
| Deploy command | `pnpm exec wrangler deploy` |

Worker 名称需要与 `wrangler.jsonc` 中的 `name` 一致。构建命令生成 `dist`，部署命令将产物上传到 Cloudflare。

高级设置中，我选择 `Create new token`，将凭证名称填写为 `blog-web-hsy-builds`。Cloudflare 会创建用于部署的 API token。

构建变量 `NODE_VERSION` 填写 `24`，pnpm 版本由仓库的 `package.json` 声明。完成后点击 Deploy，等待构建和部署结束。

连接仓库后，后续推送会触发构建和部署。[Workers Builds 说明](https://developers.cloudflare.com/workers/ci-cd/builds/)、[构建参数说明](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)

## 找到并启用生产网址

首次部署后，我在 Worker 页面进入 Domains，找到 Worker URL 区域。控制台显示了 Production 和 Preview 两行，本站的生产地址位于 Production 一行。

```text
https://blog-web-hsy.hshu96260.workers.dev/
```

这次配置时，Production 行右侧的开关处于关闭状态。启用后，再打开对应网址就可以访问博客。

`workers.dev` 地址由 Worker 名称和账号子域名组成，其他账号会获得自己的地址。它也让博客可以先使用 Cloudflare 提供的域名上线。[默认域名说明](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)

## 设置 SITE_URL 并重新部署

获得实际网址后，在 Worker 的 Settings 中找到 Build 或 Builds，再进入 Build variables and secrets，设置下面的构建变量。

| 变量名 | 本站使用的值 |
| --- | --- |
| `NODE_VERSION` | `24` |
| `SITE_URL` | `https://blog-web-hsy.hshu96260.workers.dev/` |

`SITE_URL` 使用完整的 HTTPS 地址，末尾带 `/`。Astro 构建时会读取它，用于生成页面的 canonical 链接、RSS、robots.txt 和 sitemap。

保存构建变量后，重新触发部署，让输出文件使用实际的网站地址。项目中也已把当前公网地址设为默认值，后续更换域名时可以通过 `SITE_URL` 覆盖。

## 上线后需要检查哪些内容

- 首页是否显示 SunnyHuang 的名字、微信头像和文章列表。
- 文章、关于页面和归档能否正常访问。
- 分类、标签、目录和明暗主题是否可用。
- 手机宽度下能否阅读，菜单能否打开。
- 搜索能否找到已发布的文章。
- `/rss.xml`、`/robots.txt` 和 `/sitemap-index.xml` 是否使用正式站点地址。
- 访问不存在的路径时能否显示自定义 404 页面。

## 以后怎样更新博客

日常更新时，我只需要编辑 Markdown，完成本地预览，再把修改推送到 GitHub。

```powershell
corepack pnpm check
corepack pnpm build
git add src/content/posts/
git commit -m "docs: publish a new post"
git push origin main
```

如果文章用到了新图片，还需要把对应的 `public/` 图片文件一起提交。Cloudflare 会接着构建并部署，更新完成后就能通过同一个网址阅读新内容。

这次搭建让我熟悉了从模板配置、Git 提交到自动部署的过程。之后会继续在这个博客中记录技术实践和学习笔记，也希望这篇过程记录能帮助第一次发布个人博客的朋友。
