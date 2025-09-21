# H3 服务器案例

基于 Deno 和 H3 框架的简单 HTTP 服务器示例。

## 项目前置环境

主机环境必须具备 deno , deno 是一个服务端 `JavaScript` 运行时 , 可直接运行 `typescript`.

可参考 [deno官方文档](https://deno.com/)

## 项目启动方法

### 本地开发
```bash
deno task dev
```

### Docker 构建和运行
```bash
# 构建镜像
docker build -t deno-h3 .

# 运行容器
docker run -p 5020:5010 deno-h3
```

## CI/CD 部署

项目包含两个 GitHub Actions workflows：

### 1. 自动构建镜像 (docker-build.yml)
- **触发条件**: 推送到 `main` 分支、创建 PR、手动触发
- **功能**: 自动构建 Docker 镜像并推送到镜像仓库
- **支持架构**: linux/amd64, linux/arm64
- **镜像标签**: 
  - `latest` (main 分支)
  - `sha-{commit}` (提交哈希)
  - `{branch-name}` (分支名)

### 2. 手动部署 (deploy.yml)
- **触发条件**: 手动触发
- **功能**: 部署指定镜像标签到服务器
- **部署环境**: 
  - `latest` - 生产环境 (端口 5020)
  - `staging` - 测试环境 (端口 5021)

### 必需的 GitHub Secrets
```
DOCKER_REGISTRY=dr.lucardo.website:4443
DOCKER_USERNAME=your_username
DOCKER_PASSWORD=your_password
DEPLOY_HOST=your_server_host
DEPLOY_USER=your_server_user
SSH_PRIVATE_KEY=your_ssh_private_key
SSH_PORT=22
```

## API 端点

- `/success` - 返回成功响应
- `/redirect` - 重定向响应
- `/client-error` - 客户端错误响应
- `/server-error` - 服务器错误响应
- `/timeout` - 超时响应
- `/*` - 默认成功响应

## 项目作用

用来测试 HTTP 请求，后期可能对项目扩展额外的功能。

## 技术栈

- **运行时**: Deno
- **框架**: H3
- **容器化**: Docker
- **CI/CD**: GitHub Actions
- **部署**: Podman
