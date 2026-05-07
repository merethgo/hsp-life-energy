# 高敏感生命能量测评（GitHub 静态版）

这是从原始全功能项目中复制出来的 **纯前端静态副本**，用于上传到 GitHub 仓库或部署为静态站点。

这份副本的目标是：

- 用户打开网页
- 直接进入测评
- 完成 48 题
- 在浏览器本地生成报告
- 自己保存或打印 PDF

这版 **不包含后台、数据库、管理员登录或数据收集能力**。

## 当前保留的功能

- 首页入口
- 48 题答题页
- 本地生成报告页
- 浏览器保存 / 打印 PDF
- 本地答题进度恢复

## 当前移除的功能

- 基础信息页
- 后台登录
- 报告搜索 / 删除
- 服务端提交接口
- 本地文件存储
- Supabase
- 自动收集用户数据
- 邮件发送

## 用户流程

1. 打开首页
2. 点击“开始测评”
3. 完成 48 题
4. 在浏览器本地生成报告
5. 跳转到固定的 `/report`
6. 通过浏览器保存 / 打印 PDF

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 本地存储

当前会使用浏览器 `localStorage` 保存这些内容：

- `hsle_assessment_progress`：答题进度
- `hsle_assessment_report`：最近一次生成的报告

如果你清空浏览器本地存储，再访问 `/report`，页面会提示你先完成测评。

## 静态导出

项目已经配置为静态导出模式：

- `output: "export"`
- `trailingSlash: true`
- `images.unoptimized = true`

执行：

```bash
npm run build
```

构建完成后，会生成静态产物，可用于 GitHub Pages 或其他静态托管平台。

## GitHub Pages 说明

这个副本已经带了一个通用的 GitHub Pages 工作流：

- `.github/workflows/deploy-pages.yml`

默认逻辑是：

1. 代码推送到 `main`
2. GitHub Actions 自动安装依赖
3. 自动以仓库名作为 `NEXT_PUBLIC_BASE_PATH`
4. 自动构建静态产物
5. 自动发布到 GitHub Pages

如果你后续不想立刻上线 Pages，也没关系。当前这份副本至少已经做到：

- 可以本地运行
- 可以静态构建
- 可以安全上传 GitHub
- 以后如果要开 Pages，已经有现成工作流

## 推荐验证

上传前建议至少执行：

```bash
npm run lint
npm run build
```
