import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "SunnyHuang 的博客",
	subtitle: "记录嵌入式开发、AI 学习与旅行日常",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "/wallpapers/soured-apple-clouds.webp", // 动态壁纸的静态封面
		videoSrc: "/wallpapers/soured-apple-clouds.mp4", // 相对于 public 目录的路径
		position: "top",
		credit: {
			enable: true,
			text: "SouredAppleClouds",
			url: "https://steamcommunity.com/sharedfiles/filedetails/?id=1948961570",
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{ src: "/avatar.jpg" },
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{ name: "相册", url: "/albums/" },
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/Senanate/blog_web_Hsy", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.jpg",
	name: "SunnyHuang",
	bio: "上海海事大学电子信息专业大四学生，已推免至华东理工大学控制工程专硕。擅长嵌入式开发，正在学习用 AI 搭建网站。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Senanate",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
