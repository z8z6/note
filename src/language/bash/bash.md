---
cover: bash
topic: "Shell"
keywords:
  - "Bash"
  - "Shell"
  - "bash"
---

# Bash 实用笔记

Bash 脚本适合自动化构建、文件处理和命令编排。脚本开头建议使用 `#!/usr/bin/env bash`，并显式开启所需的错误策略。

## 安全起点

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

cleanup() {
  printf 'cleanup\n'
}
trap cleanup EXIT
```

`-e` 在未处理的失败处退出，`-u` 禁止读取未定义变量，`pipefail` 让管道中任一命令失败都能反映到结果。它们会改变控制流，脚本仍需针对预期失败编写 `if` 或 `||` 分支。

## 变量与参数

```bash
name=${1:-operator}
readonly output_dir="${2:-./dist}"
printf 'name=%s output=%s\n' "$name" "$output_dir"
```

引用变量时通常应写成 `"$value"`，避免空格分词和通配符展开。数组使用 `items=("a b" "c")`，遍历时使用 `"${items[@]}"`。

## 条件与 case

```bash
case "${1:-help}" in
  build)
    printf 'building...\n'
    ;;
  test|check)
    printf 'checking...\n'
    ;;
  *)
    printf 'usage: %s {build|test}\n' "$0"
    exit 2
    ;;
esac
```

```bash
if [[ -f "$output_dir/index.html" ]]; then
  printf 'artifact ready\n'
fi
```

`[[ ... ]]` 是 Bash 条件语法，比传统 `[` 更不易受到分词影响；但追求 POSIX `sh` 兼容时应使用 `[ ... ]`。

## 函数与检查

```bash
latest_tag() {
  git tag --sort=-version:refname | head -n 1
}

tag=$(latest_tag)
printf 'latest tag: %s\n' "$tag"
```

```bash
bash -n script.sh       # 语法检查
shellcheck script.sh    # 静态检查（需安装 ShellCheck）
bash -x script.sh       # 打印执行轨迹
```

命令替换会去掉末尾换行。处理任意文件名时，不要解析 `ls` 输出，应优先使用 `find -print0`、数组或工具自带的结构化输出。
