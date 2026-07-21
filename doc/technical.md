# Technical

## 1. 技术栈

- React 18 + TypeScript：状态与界面渲染。
- Less：游戏视觉系统、动画与响应式缩放。
- Vite 5：开发与相对路径（`base: './'`）生产构建。
- Web Audio API：用户首次交互后合成点击、移动、连击与结算音效。
- `localStorage`：保存单机最高分与语言覆盖设置。
- AlterU Runtime：通过 `@shared/leaderboard` 的按游戏 UUID 独立排行榜接口提交、拉取和展示最高分。

## 2. 目录结构

- `src/NoodlePanic/NoodlePanic.tsx`：场景、HUD、棋盘与开始/结算覆盖层。
- `src/NoodlePanic/hooks/useNoodlePanic.ts`：游戏循环、无限培养推进、菌株移动/分裂、计分、音效与缩放。
- `src/NoodlePanic/strains.ts`：DNA 基因池、随机菌株生成、危险格形态、移动路线与分裂占格规则。
- `src/NoodlePanic/NoodlePanic.less`：培养皿、培养液、净化球、DNA 菌株外观与低动态模式。
- `src/NoodlePanic/i18n/index.ts`：中文/英文文案与本地语言选择。
- `src/shared/runtime/`、`src/shared/leaderboard/`：AlterU bridge、排行榜 API、榜单弹层与用户资料跳转。
- `doc/requirements.md`、`doc/visual.md`、`doc/publish-record.md`：玩法、视觉与发布状态记录。
- `meta.json`：游戏标题与封面路径元数据。

## 3. 核心模块

- 状态模型为 `start | playing | over`；培养成功时从 DNA 基因池生成一株与当前外显特征不同的新菌，污染失败时保持当前菌株。hook 用 `requestAnimationFrame` 根据剩余秒数将各菌株的基础移动间隔缩短至 80% 与 62%。
- `strains.ts` 的 DNA 包含色素、形体、动态、轨迹、分裂：每个基因从 4 个离散值随机抽取，杆菌/链菌/弧菌/孢菌分别占用 1–4 个危险格；具有分裂基因的菌株每 1.8 秒在 650 ms 的环形预警中扩展危险格。
- 32 个逻辑格渲染为圆形“净化球”目标：中央 24 个，左右各 4 个外围球。点击在事件发生时立即判定，安全净化球按当前连锁得分，危险格结算。
- 场景根据 `window.innerWidth / 390` 和 `window.innerHeight / 720` 取较小值缩放；培养皿外 HUD、实验记录结算与皿内可点区域在 390×720 的安全布局中分别定位。
- 最高分同步写入 `noodle-panic.best`；AudioContext 创建失败不会影响游戏。
- 每局开始时从排行榜快照记录自己的旧最高分；培养结束后只提交正分，并刷新榜首入口。若新分高于旧纪录，会重新拉榜，向本局刚超过且分数最高的一位其他玩家发送一次 `score_beat` 通知；平台调用失败静默处理。
- 榜单仅在 AlterU 环境请求数据。完整榜单显示排名、头像、昵称、分数和“我”标识；其他用户行用点击打开资料页，自己的行不可点。站外打开弹层时不请求榜单，改显示下载 AlterU 的 CTA。
- `prefers-reduced-motion` 将所有非必要动画收敛为即时状态改变。

## 4. 扩展点

- 在 `strains.ts` 新增或调整 DNA，即可添加菌株、形态、路线、分裂规则与移动速度。
- 在 `types.ts` 与 `useNoodlePanic.ts` 修改格子尺寸、时间、关卡推进和得分倍率。
- 在 `NoodlePanic.less` 调整实验室色温、培养皿/培养液材质、菌株动效和窄屏排版。
- 在 `i18n/index.ts` 添加语言或改写全部玩家可见文案。
- 在 `NoodlePanic.tsx` 增加暂停、每日挑战或赛季奖励等状态；如接入平台存档，应改用本地镜像状态后再持久化。
