// const clientEngineServer =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:3000"
//     : "https://client-engine-server.leanapp.cn";

import { Client, Player } from "@leancloud/play";

let client: Client;

export const global = {
  client: client,
  APP_ID: 'VlqXg37sxQDFYtUUfVbSplwI-gzGzoHsz',
  APP_KEY: 'YEh4M37o7Tunq59PIdEqJFC2',
  // roomRequestUrl: 'http://localhost:3000/reservation',
  roomRequestUrl: 'https://turn-game-client-engine.leanapp.cn/reservation'
};