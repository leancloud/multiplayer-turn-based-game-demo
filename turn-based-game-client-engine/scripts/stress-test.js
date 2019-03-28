const { default: axios } = require("axios");
const { Play, Region, ReceiverGroup, Event } = require("@leancloud/play");

const HOST = process.env.HOST || "http://localhost:3000";

const APP_ID = process.env.LEANCLOUD_APP_ID;
const APP_KEY = process.env.LEANCLOUD_APP_KEY;
const MASTER_KEY = process.env.LEANCLOUD_APP_MASTER_KEY;

if (!APP_ID)
  throw new Error(
    "process.env.LEANCLOUD_APP_ID not set, run `$(lean env)` to export."
  );

let playerCount = 50;
const sendEventInterval = 100;

setInterval(() => {
  if (!playerCount) return;
  playerCount--;
  const play = new Play();
  play.init({
    appId: APP_ID,
    appKey: APP_KEY,
    region: Region.NorthChina
  });
  play.userId = Date.now().toString();
  play.connect();
  play.once(Event.CONNECTED, async () => {
    const {
      data: { roomName }
    } = await axios.post(`${HOST}/reservation`, { playerId: play.userId });
    console.log(`${play.userId} join ${roomName}`);
    play.joinRoom(roomName);
    play.once(Event.ROOM_JOINED, () => {
      setInterval(() => {
        try {
          play.sendEvent(
            "play",
            { index: 1 },
            { receiverGroup: ReceiverGroup.All }
          );
        } catch (e) {}
      }, sendEventInterval);
    });
  });
}, 1000);

setInterval(async () => {
  const {
    data: {
      memoryUsage,
      osLoadavg,
      gameManager: { laod }
    }
  } = await axios.get(`${HOST}/admin/status`, {
    auth: {
      username: "admin",
      password: MASTER_KEY
    }
  });
  console.log(
    Date.now(),
    JSON.stringify({
      memoryUsage,
      osLoadavg,
      gameManagerLoad: laod
    })
  );
}, 1000);
