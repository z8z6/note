---
cover: git
topic: "版本控制"
keywords:
  - "Git"
  - "版本控制"
  - "git"
---

# Git 常用工作流

Git 记录的是提交图，而不是简单的文件版本列表。日常操作可以围绕“检查状态、制作提交、同步远端、恢复失误”四个阶段组织。

## 初始配置

```shell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global --list
```

代理仅在确有需要时配置，取消时使用 `--unset`：

```shell
git config --global http.proxy http://127.0.0.1:7890
git config --global --unset http.proxy
```

## 克隆与检查

```shell
git clone <远程仓库地址>
git status --short
git diff
git diff --staged
git log --oneline --decorate --graph -12
```

`git diff` 查看工作区与暂存区差异，`--staged` 查看将进入下一次提交的内容。提交前同时检查两者能减少误提交。

## 分支

```shell
git branch --all
git switch -c feature/search
git switch main
git branch -d feature/search
```

从远端分支创建本地跟踪分支：

```shell
git fetch origin
git switch --track origin/release/5.2
```

推送并建立上游关系：

```shell
git push -u origin feature/search
git push origin local-name:remote-name
```

## 制作提交

```shell
git add src/file.cpp
git commit -m "fix: handle empty input"
```

优先按逻辑单元暂存文件或使用 `git add -p` 选择区块。不要把格式化、重构和行为修改混进一个难以审查的提交。

## 标签

```shell
git tag --list
git tag -a v1.0.0 -m "release v1.0.0"
git push origin v1.0.0
git switch -c inspect-v1 v1.0.0
```

## 安全恢复

```shell
git restore src/file.cpp           # 丢弃未暂存修改
git restore --staged src/file.cpp  # 取消暂存，保留工作区
git revert <commit>                # 新建一个反向提交
git reflog                         # 查找近期引用移动记录
```

::: warning
`restore` 可能丢失未提交内容；`reset --hard` 与强制推送影响更大。执行前先确认 `status`、目标提交和协作者状态。
:::
