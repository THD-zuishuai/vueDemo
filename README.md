# 免费游戏公益下载 · Free Game Download

Vue 3 + Vite 纯前端游戏发现与下载导航站。游戏、分类、首页文案与攻略统一维护在 `src/data/site-content.json`。项目不包含后端、账号或数据库。演示条目均为原创虚构内容，不提供游戏下载。

## 本地开发

```sh
npm install
npm run dev
```

开发服务器运行时打开 `/__content-editor`，可调整基础信息、分类、游戏与攻略，实时查看/校验 JSON，并复制或导出。编辑器只保存浏览器草稿，不会自动写回项目文件；请复制/导出后手动替换 `src/data/site-content.json`。

网盘入口保存在游戏的 `downloadLinks` 数组中。只有正式发布、非演示且 `licenseStatus` 为 `permission_confirmed` 的游戏，才可以启用并展示有效的 HTTPS/HTTP 网盘链接。请只填写已核实授权的真实链接。

## 构建与部署

```sh
npm run build
npm run preview
```

默认构建使用根路径。GitHub Pages 项目站使用 `npm run build:github`（Vite `base` 为 `/vueDemo/`）。路由使用 hash 模式，静态托管刷新详情页不会依赖 history fallback。
