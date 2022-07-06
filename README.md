# hermit crab

hilshire 的[博客](https://www.hilshire.cyou/)。

## 配置

使用环境变量进行配置，也可以使用 .env.local 写死

配置列表：
```yml
# 项目相关
SECRET_KEY    # jwt 的 secret_key
CLAIM         # 后台管理的密码
# database 相关
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


## 计划

到目前为止第一阶段的计划已经完成了。实际上这个博客已经开始运作了。不过之前的一些设计被我摒弃了——你会发现似乎花了很大力气的 `Essay` 和 `Tip` 视乎没有用。之后会改成类似 `type` 这样的字段来进行控制。

- [x] 清除项目中的冗余代码
- [x] 修改数据库结构，增加 type
- [ ] 实现 tag 功能
- [ ] 实现一个类似文档库的功能（不确定，可能会放在更后面的版本里）