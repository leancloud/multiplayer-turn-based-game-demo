# 回合制在线对战 Demo

这款 Demo 是用 LeanCloud 实时对战和 Client Engine 实现的一款回合制对战游戏，全部服务端及客户端的代码总共花费了约 7 天的时间。试玩链接：https://sssss

主要界面如下：


## 启动游戏
### 服务端

登录 LeanCloud 控制台，进入「游戏」-「Client Engine」-「部署」，选择「开始试用」。

安装 LeanCloud [命令行工具](https://leancloud.cn/docs/leanengine_cli.html#hash1443149115)。

```sh
cd turn-based-demo-client-engine
lean login
lean switch
```
分组时选择 `_client-engine` 分组。

```sh
npm install
DEBUG=ClientEngine*,RPS*,Play lean up
```

### 客户端
客户端代码位于 `./turn-based-demo-client/assets` ，找到 `Global.ts` 文件，修改其中的 APP_ID 和 APP_KEY 和服务端选择的应用相同，`roomRequestUrl` 使用 `localhost:3000`。

安装依赖：

```sh
npm install
```

依赖安装完成后，使用 Cocos Creator 运行 `./turn-based-demo-client` 中的项目。


## 实现方式

服务端使用了 LeanCloud 实时对战云和 Client Engine 。客户端之间用实时对战云来通讯，游戏的逻辑写在 Client Engine 中，MasterClient 在 Client Engine 中控制房间内的逻辑。在游戏过程中，客户端将全部的事件发送给 MasterClient，由 MasterClient 在服务端执行相关逻辑后，再通过自定义事件指示客户端播放相关动画。

具体流程如下：

* 客户端请求 Client Engine 获得房间名称、加入房间。
* 房间人满后，位于 Client Engine 中的 MasterClient 为两个客户端分配人物属性。
* MasterClient 向房间内广播「游戏开始」事件，客户端收到事件后加载 Room 场景。
* 客户端做出选择，并将选项发送给 MasterClient。
* MasterClient 收到两方客户端的选项后，计算英雄血值，并广播「开始本轮对战」事件。
* 客户端播放对战动画，播放完成后根据服务端的计算结果校准 UI。
* 重复每轮对战，直到某一名英雄血值为 0。

### 服务端代码

这里的服务端代码指的是 Client Engine 中的游戏逻辑代码，位于 `./turn-based-demo-client-engine/src`。

```
├── configs.ts        // 配置文件
├── index.ts          // 项目入口
├── reception.ts      // Reception 类实现文件，GameManager 的子类，负责管理 Game，在这个文件中撰写了创建 Game 的自定义方法
└── turn-based-game.ts       // 实现了 TurnBasedGame 类，用于控制房间内的具体逻辑。
```

服务端的代码沿用了 LeanCloud Client Engine [示例项目](https://github.com/leancloud/client-engine-nodejs-getting-started)中的代码，仅修改了示例项目的 `rps-game.ts` 为 `turn-based-game.ts`，在 `turn-based-game.ts` 文件中撰写了自己的游戏逻辑。

关于如何使用 Client Engine 开发游戏逻辑，请参考 LeanCloud 官方文档：[《你的第一个 Client Engine 小游戏》](https://leancloud.cn/docs/client-engine-first-game-node.html)

### 客户端代码

客户端位于 `./turn-based-demo-client/assets`。

```
├── Global.ts        // 一些全局的配置或变量
├── Events.ts        // 接收所有通过 LeanCloud 实时对战云发送的自定义事件。
├── Hero.ts          // 在这里撰写英雄的属性及自定义方法
├── Login.ts      // 登录场景文件
├── Lobby.ts      // 大厅场景文件
└── Room.ts       // 房间场景文件
```

## 主要功能实现介绍

### 快速开始
随便找一个有空位的房间快速开始。服务端代码位于 `index.ts` 文件，详情请参考 LeanCloud 文档「快速开始」(https://leancloud.cn/docs/client-engine-first-game-node.html#hash-1870869335)。

客户端代码位于 `Lobby.ts`，详细介绍请参考[入口 API：快速开始](https://leancloud.cn/docs/client-engine-first-game-node.html#hash-65842943)

### 设置人物属性
当房间人满后，MasterClient 会设置位于房间内的人物属性，包括血值、攻击力、防御力、治疗能力、速度等，此段逻辑位于服务端 `turn-based-game.ts` 文件中。设置人物属性的详细介绍请参考 LeanCloud 文档[玩家自定义属性](https://leancloud.cn/docs/multiplayer-guide-js.html#hash700221845)。

### 房间内对战
房间内对战主要依靠[自定义事件](https://leancloud.cn/docs/multiplayer-guide-js.html#hash1368192228)进行通信，主要有这些自定义事件：
* MasterClient 广播事件，位于服务端代码 `turn-based-game.ts` 文件中。
  * 游戏开始（`game-start`）
  * 游戏结束（`game-over`）
  * 开始播放动画（`begin-round-anim`）
* 客户端事件，位于客户端代码 `Room.ts` 及 `Events.ts` 文件中。
  * 发送选项给 MasterClient（`action`）

