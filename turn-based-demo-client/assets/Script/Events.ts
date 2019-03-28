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
import { Client, Event } from "@leancloud/play";

@ccclass
export default class NewClass extends cc.Component {

  @property(cc.Label)
  label: cc.Label = null;

  @property
  text: string = 'hello';

  @property()
  client: Client = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    cc.game.addPersistRootNode(this.node);
    this.client = global.client;

    this.client.on(Event.CUSTOM_EVENT, event => {
      const { eventId, eventData } = event;

      if (eventId === 'game-start') {
        cc.director.loadScene('Room');
      }

      if (eventId === 'begin-round-anim') {
        cc.find('RoomCanvas').emit('begin-round-anim', eventData);
      }

      if (eventId === 'game-over') {
        cc.find('RoomCanvas').emit('game-over', eventData);
      }
    });

  }

  // update (dt) {}
}
