# 项目发布记录

## 项目身份

- 游戏 ID：`noodle-panic`
- 对外名称：Colony Lockdown / 《菌落封锁》
- 永久 UUID：`4a1897bd-8012-45c2-93b1-2a1909911ad0`
- 分类：`action`
- 源码仓库：`yinxinghuan/noodle-panic`，默认分支 `main`
- 游戏列表仓库：`yinxinghuan/games`，分支 `master`

## 已完成的发布步骤（2026-07-22）

1. 源码仓库已完成首次有效推送，`main` 指向 `1e57510`（`feat: add AlterU leaderboard flow`）。
2. GitHub Pages 已启用并由工作流部署成功；线上地址为 <https://yinxinghuan.github.io/noodle-panic/>。
3. 已验证线上 bundle 含排行榜、`score_beat` 和站外下载 AlterU 引导。
4. `games.json` 已在首位登记游戏、UUID、`action` 分类、线上地址、封面和 `main.zip` 源码包。
5. 列表封面已复制至 `games/posters/noodle-panic.png`，为 1024×1024 PNG；列表仓库提交为 `ac52ab3`（`add: Colony Lockdown`）。
6. `scripts/verify-game-uuid.py --game noodle-panic` 已通过，游戏源码注入 UUID 与公开清单一致。

## 发布核验地址

- 游戏：<https://yinxinghuan.github.io/noodle-panic/>
- 公开清单：<https://yinxinghuan.github.io/games/games.json>
- 列表封面：<https://yinxinghuan.github.io/games/posters/noodle-panic.png>
- Remix 源码包：<https://github.com/yinxinghuan/noodle-panic/archive/refs/heads/main.zip>

## 平台侧待办

平台客户端读取的是由同事维护的迁移工具写入的游戏数据库，而不是运行时直接读取 `games.json`。本工作区没有该迁移工具，因此还需平台同事重新执行 `games.json → 平台数据库` 迁移，并在 AlterU 客户端确认游戏条目可见。此步骤完成前，不应声称客户端列表已经入库。
