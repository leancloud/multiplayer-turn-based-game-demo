// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { Client } from '@leancloud/play';
import { global } from './Global';

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.EditBox)
  userIdEditBox: cc.EditBox = null;

  @property(cc.Button)
  loginButton: cc.Button = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    const userId = Date.now().toString();
    this.userIdEditBox.string = userId;
  }

  // update (dt) {}

  async onLoginButtonClicked() {
    const client = new Client({
      appId: global.APP_ID,
      appKey: global.APP_KEY,
      playServer: global.PLAY_SERVER,
      userId: this.userIdEditBox.string,
    });
    await client.connect();
    global.client = client;
    cc.director.loadScene('Lobby');
  }
}
