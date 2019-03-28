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
import { global } from './Global';
import { Client, CreateRoomFlag, Event, Room } from "@leancloud/play";

@ccclass
export default class NewClass extends cc.Component {

  @property(cc.Label)
  userNameLabel: cc.Label =  null;

  @property(cc.Button)
  matchmakinggButton: cc.Button = null;

  @property(cc.Label)
  matchmakingLabel: cc.Label = null;

  @property()
  client: Client = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    this.client = global.client;
    this.userNameLabel.string = '当前用户： ' + global.client.userId;
  }

  // update (dt) {}

  async onMatchmakingButtonClicked() {
    const { roomName } = await (await fetch(
      global.roomRequestUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          playerId: global.client.userId
        })
      }
    )).json();
    
    this.matchmakingLabel.string = '正在等待对手......';
    this.matchmakingLabel.node.active = true;
    this.matchmakinggButton.node.active = false;

    this.client.joinRoom(roomName);

  }
}
