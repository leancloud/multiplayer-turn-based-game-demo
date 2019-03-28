const APP_ID = process.env.LEANCLOUD_APP_ID!;
const APP_KEY = process.env.LEANCLOUD_APP_KEY!;
const MASTER_KEY =  process.env.LEANCLOUD_APP_MASTER_KEY!;
if (APP_ID === undefined) {
  throw new Error("LEANCLOUD_APP_ID not set");
}
if (APP_KEY === undefined) {
  throw new Error("LEANCLOUD_APP_KEY not set");
}
if (MASTER_KEY === undefined) {
  throw new Error("LEANCLOUD_APP_MASTER_KEY not set");
}

export {
  APP_ID,
  APP_KEY,
  MASTER_KEY,
};
