import {
  ICreateGameOptions,
  LoadBalancerFactory,
} from "@leancloud/client-engine";
import bodyParser = require("body-parser");
import cors = require("cors");
import d = require("debug");
import express = require("express");
import basicAuth = require("express-basic-auth");
import os = require("os");
import { APP_ID, APP_KEY, API_SERVER, MASTER_KEY } from "./configs";
import Reception from "./reception";
import TurnBasedGame from "./turn-based-game";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 首页仅起到响应健康检查的作用
app.get("/", (req, res) => {
  res.send(`
<p>这是 LeanCloud Client Engine 的服务端部分，客户端部分的示例代码在 https://github.com/leancloud/client-engine-demo-webapp
    `);
});

const reception = new Reception({
  gameConstructor: TurnBasedGame,
  appId: APP_ID,
  appKey: APP_KEY,
  playServer: API_SERVER,
  concurrency: 2,
});

const loadBalancerFactory = new LoadBalancerFactory({
  poolId: `${APP_ID.slice(0, 5)}-${
    process.env.LEANCLOUD_APP_ENV || "development"
  }`,
  redisUrl: process.env.REDIS_URL__CLIENT_ENGINE,
});

const loadBalancer = loadBalancerFactory
  .bind(reception, ["makeReservation", "createGameAndGetName"])
  .on("online", () => console.log("Load balancer online"))
  .on("offline", () => {
    console.warn(
      `The load balancer can not connect to Redis server. Client Engine will keep running in standalone mode.
It's probably fine if you are running it locally without a Redis server. Otherwise, check project configs.`
    );
  });

const debug = d("ClientEngine");

// TODO: 这个接口需要鉴权与流控
app.post("/reservation", async (req, res, next) => {
  try {
    const { playerId } = req.body as {
      playerId: any;
    };
    if (typeof playerId !== "string") {
      throw new Error("Missing playerId");
    }
    debug(`Making reservation for player[${playerId}]`);
    const roomName = await reception.makeReservation(playerId);
    debug(`Seat reserved, room: ${roomName}`);
    return res.json({
      roomName,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/game", async (req, res, next) => {
  try {
    const { playerId, options } = req.body as {
      playerId: any;
      options: ICreateGameOptions;
    };
    if (typeof playerId !== "string") {
      throw new Error("Missing playerId");
    }
    debug(`Creating a new game for player[${playerId}]`);
    const roomName = await reception.createGameAndGetName(playerId, options);
    debug(`Game created, room: ${roomName}`);
    return res.json({
      roomName,
    });
  } catch (error) {
    next(error);
  }
});

app.use(
  "/admin",
  basicAuth({
    challenge: true,
    realm: APP_ID,
    users: { admin: MASTER_KEY },
  })
);

app.get("/admin/status", async (req, res, next) => {
  try {
    res.json({
      loadBalancer: await loadBalancer.getStatus(),
      memoryUsage: process.memoryUsage(),
      osLoadavg: os.loadavg(),
      reception: await reception.getStatus(),
    });
  } catch (error) {
    next(error);
  }
});

app.listen(process.env.LEANCLOUD_APP_PORT || 3000);

// Graceful shutdown
process.on("SIGTERM", async () => {
  debug("SIGTERM recieved. Closing the LB.");
  try {
    await loadBalancer.close();
    debug("Shutting down.");
    setTimeout(() => {
      process.exit(0);
    }, 100);
  } catch (error) {
    // 如果发生了异常，什么都不做，Client Engine 在超时后会 SIGKILL 掉进程
    console.error("Closing LB failed:");
    console.error(error);
  }
});
