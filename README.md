# hermit crab

hilshire 的[博客](https://www.hilshire.cyou/)。

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

## 数据库迁移

开发环境会自动同步实体结构。生产环境已禁用自动同步；使用默认 SQLite 时，应用启动会执行已登记的 migration。所有后续表结构变更必须先通过 TypeORM migration 审核；不要依赖应用启动时的自动同步。


## 计划

到目前为止第一阶段的计划已经完成了。实际上这个博客已经开始运作了。不过之前的一些设计被我摒弃了——你会发现似乎花了很大力气的 `Essay` 和 `Tip` 视乎没有用。之后会改成类似 `type` 这样的字段来进行控制。

- [x] 清除项目中的冗余代码
- [x] 修改数据库结构，增加 type
- [ ] 实现 tag 功能
- [ ] 实现一个类似文档库的功能（不确定，可能会放在更后面的版本里）
