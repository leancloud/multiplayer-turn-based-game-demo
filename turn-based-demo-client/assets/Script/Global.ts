// const clientEngineServer =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:3000"
//     : "https://client-engine-server.leanapp.cn";

import { Client, Player } from "@leancloud/play";

let client: Client;

export const global = {
  client: client,
  APP_ID: 'H2wuPscPB4vau8OdMA4zRyLm-gzGzoHsz',
  APP_KEY: 'SAeIKtSNsqTNE3Di4hYmppLE',
  // roomRequestUrl: 'http://localhost:3000/reservation',
  roomRequestUrl: 'http://localhost:3000/reservation'
};