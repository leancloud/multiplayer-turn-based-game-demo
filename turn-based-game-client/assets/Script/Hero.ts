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
import { Player } from "@leancloud/play";

@ccclass
export default class NewClass extends cc.Component {

  @property(cc.ProgressBar)
  bloodProgressBar: cc.ProgressBar = null;

  @property(cc.Sprite)
  bloodProgressBarSprite: cc.Sprite = null;

  @property(cc.Label)
  nameLabel: cc.Label = null;

  // 动画表现层的属性
  @property()
  properties = {
    totalBloodValue: null,
    currentBloodValue: null,
    attackValue: null,
    defendValue: null,
    restoreValue: null,
    speed: null,
    isMoveAttack: null,
    originLocationX: null,
  };

  @property()
  player: Player = null;



  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.bloodProgressBar.progress = 1;

  }

  start() {

  }

  // update (dt) {}

  updateProgressBar() {
    const progress = this.properties.currentBloodValue / this.properties.totalBloodValue;
    this.bloodProgressBar.progress = progress;
  }

  updateNameLabel(name: string) {
    this.nameLabel.string = name;
  }

}
