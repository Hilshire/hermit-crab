# hermit crab

hilshire 的[博客](https://hilshire.date/)。

## 项目结构

项目使用 Next.js Pages Router 和 TypeORM，页面、接口与数据库代码在同一个仓库中：

- `pages/`：页面路由及服务端数据读取；`pages/api/` 负责 HTTP 请求、参数校验和响应。当前页面读取通常通过 `getRepo` 直接查询实体。
- `server/`：数据库配置、实体、DTO、校验和迁移。`server/services/blog.ts` 集中处理文章系列的写入规则和事务；并非所有业务都有独立服务层。
- `components/`：界面组件。只服务于特定组件的辅助逻辑放在该功能附近；例如 `components/utterances/` 负责评论展示、GitHub 评论查询和 Utterances 加载。
- `hooks/`：供 React 组件使用的状态与生命周期逻辑。
- `middleware/`：目前负责登录验证与重定向；`utils/` 中的 `getRepo` 是现有数据库仓库入口。
- `styles/`：全局和按页面或功能组织的 SCSS。

文章写入的主要路径是 `pages/api/blog` → 参数校验 → `server/services/blog.ts` → TypeORM；文章详情由 `pages/blog/[id].tsx` 读取数据，再交给 `BlogSeries` 等组件展示。评论预览由浏览器访问 GitHub API，完整评论使用 Utterances。历史评论关联错误时，可在后台编辑文章并指定 GitHub Issue 编号。

## 配置

使用环境变量进行配置。可将 `.env.example` 复制为 `.env.local` 并填写实际值；不要提交 `.env.local`。

配置列表：
```yml
# 项目相关
SECRET_KEY    # jwt 的 secret_key
CLAIM         # 后台管理的密码
# database 相关
DATABASE_TYPE # sqlite（默认）或 mysql
DATABASE_PATH # SQLite 文件路径，默认 db/hermit-crab.sqlite
DATABASE_HOST
DATABASE_PORT
DATABASE_USERNAME
DATABASE_PASSWORD
DATABASE_NAME
# gitalk(comment) 相关, see gitalk document
NEXT_PUBLIC_GITHUB_CLIENT_ID
NEXT_PUBLIC_GITHUB_CLIENT_SECRET
NEXT_PUBLIC_GITHUB_REPO
NEXT_PUBLIC_GITHUB_OWNER
```

开发环境未配置 `SECRET_KEY` 和 `CLAIM` 时，可使用默认管理员密码 `dev-password` 登录；这两个默认值仅在 `NODE_ENV=development` 生效，生产和测试环境仍要求显式配置。开发与生产环境默认使用 SQLite，数据库文件为 `db/hermit-crab.sqlite`；SQLite 适用于单实例且磁盘持久化的部署。设置 `DATABASE_TYPE=mysql` 后，生产环境要求所有 MySQL 的 `DATABASE_*` 变量均已配置；开发环境则保留本地 MySQL 默认连接参数。

Vercel Preview/Production 不支持默认 SQLite：Vercel Function 的文件系统不是持久化数据库磁盘。Vercel 项目必须在对应环境配置 `DATABASE_TYPE=mysql` 以及 `DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_USERNAME`、`DATABASE_PASSWORD`、`DATABASE_NAME`。

## 数据库迁移

生产环境使用 SQLite 时，应用启动时自动执行迁移；使用 MySQL 时，部署前配置数据库并运行 `yarn migration:run`。文章系列迁移不支持自动回滚。
