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
import Hero from './Hero';
import { global } from './Global';
import { Client, ReceiverGroup, Player } from "@leancloud/play";

const ATTACK_ACTION = 1;
const DEFEND_ACTION = 2;
const RESTORE_ACTION = 3

@ccclass
export default class NewClass extends cc.Component {

  @property(cc.Prefab)
  heroGirlPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  heroBullPrefab: cc.Prefab = null;

  @property(cc.Node)
  myHeroNode: cc.Node = null;

  @property(cc.Node)
  rivalHeroNode: cc.Node = null;

  @property(cc.Node)
  myHero: cc.Node = null;

  @property(cc.Node)
  rivalHero: cc.Node = null;

  @property(cc.Button)
  attackButton: cc.Button = null;

  @property(cc.Button)
  defendButton: cc.Button = null;

  @property(cc.Button)
  restoreButton: cc.Button = null;

  @property(cc.Label)
  gameResultLabel: cc.Label = null;

  @property(cc.Button)
  backButton: cc.Button = null;

  @property
  client: Client = null;

  @property()
  choices: { [heroName: string]: any; } = {};

  // 每个人行动时的动画播放时间，单位 ms
  @property()
  animTime: number = 800;

  


  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.node.on('begin-round-anim', async (data) => {
      await Promise.all(Object.keys(data).map((actorId) => {
        if (actorId === String(this.myHero.getComponent(Hero).player.actorId)) {
          this.choices[this.myHero.name] = data[actorId];
        }

        if (actorId === String(this.rivalHero.getComponent(Hero).player.actorId)) {
          this.choices[this.rivalHero.name] = data[actorId];
        }
      }))

      // 播放动画
      this.playActions();

      // 动画播完后和服务端校对数值
      setTimeout(() => {
        this.adjustUIByServerData();
        this.showButtons();
      }, this.animTime * 2);
    });

    this.node.on('game-over', (data) => {
      let winner: Player = null;
      if (data['winner'] === this.myHero.getComponent(Hero).player.actorId) {
        winner = this.myHero.getComponent(Hero).player;
      } else {
        winner = this.rivalHero.getComponent(Hero).player;
      }
      setTimeout(() => {
        this.gameOver();
      }, this.animTime * 2);

    })
  }

  start() {
    this.client = global.client;
    this.drawHeros();
    this.adjustUIByServerData();

    // 由于 choices 主要控制动画，因此在客户端我们用节点的 name 作为 key。
    this.choices = {
      [this.myHero.name]: null,
      [this.rivalHero.name]: null,
    }
  }

  // update (dt) {}

  // BUTTON EVENTS
  async onAttackButtonClicked() {
    const eventData = {
      'action': ATTACK_ACTION,
    }

    await this.client.sendEvent('action', eventData, { receiverGroup: ReceiverGroup.MasterClient });
    this.hideActionButtons();

  }

  async onDefendButtonClicked() {
    const eventData = {
      'action': DEFEND_ACTION,
    }

    await this.client.sendEvent('action', eventData, { receiverGroup: ReceiverGroup.MasterClient });
    this.hideActionButtons();
  }

  async onRestoreButtonClicked () {
    const eventData = {
      'action': RESTORE_ACTION,
    }

    await this.client.sendEvent('action', eventData, { receiverGroup: ReceiverGroup.MasterClient });
    this.hideActionButtons();
  }

  async onBackButtonClicked () {
    await this.client.close();
    cc.director.loadScene('Lobby');
  }

  // CUSTOM METHODS
  drawHeros() {
    const rivalPlayer = this.client.room.playerList.find((player, index, array) => {
      return (!player.isLocal && !player.isMaster);
    });

    let rivalHero: cc.Node;
    const rivalHeroName = rivalPlayer.customProperties.heroName;
    switch (rivalHeroName) {
      case 'HeroBull':
        rivalHero = cc.instantiate(this.heroBullPrefab);
        rivalHero.getComponent(Hero).player = rivalPlayer;
        break;
      case 'HeroGirl':
        rivalHero = cc.instantiate(this.heroGirlPrefab);
        rivalHero.getComponent(Hero).player = rivalPlayer;
        break;
      default:
        break;
    }

    rivalHero.parent = this.node;
    rivalHero.setPosition(cc.v2(this.rivalHeroNode.x, this.rivalHeroNode.y));
    this.heroDefaultAnim(rivalHero);

    this.rivalHero = rivalHero;
    this.rivalHero.scaleX = -1;
    this.rivalHero.getComponent(Hero).properties.originLocationX = this.rivalHero.x;
    const rivalHeroScript = this.rivalHero.getComponent(Hero);
    rivalHeroScript.updateNameLabel('对方');
    const rivalHeroNameLabelNode = this.rivalHero.getChildByName('NameLabel');
    rivalHeroNameLabelNode.scaleX = -1;

    let myHero: cc.Node;
    const myHeroName = global.client.player.customProperties.heroName;
    switch (myHeroName) {
      case 'HeroBull':
        myHero = cc.instantiate(this.heroBullPrefab);
        myHero.getComponent(Hero).player = global.client.player;
        break;
      case 'HeroGirl':
        myHero = cc.instantiate(this.heroGirlPrefab);
        myHero.getComponent(Hero).player = global.client.player;
        break;
      default:
        break;
    }
    myHero.parent = this.node;
    myHero.setPosition(cc.v2(this.myHeroNode.x, this.myHeroNode.y));

    this.myHero = myHero;
    this.heroDefaultAnim(myHero);
    this.myHero.getComponent(Hero).properties.originLocationX = this.myHero.x;
    const myHeroScript = this.myHero.getComponent(Hero);
    myHeroScript.updateNameLabel('我');
  }

  conformPropertiesToServer(hero: cc.Node) {
    const serverProperties = hero.getComponent(Hero).player.customProperties;
    const heroProperties = hero.getComponent(Hero).properties;

    heroProperties.totalBloodValue = serverProperties.totalBloodValue;
    heroProperties.currentBloodValue = serverProperties.currentBloodValue;
    heroProperties.attackValue = serverProperties.attackValue;
    heroProperties.defendValue = serverProperties.defendValue;
    heroProperties.restoreValue = serverProperties.restoreValue;
    heroProperties.speed = serverProperties.speed;
    heroProperties.isMoveAttack = serverProperties.isMoveAttack;
  }

  adjustUIByServerData() {
    this.conformPropertiesToServer(this.myHero);
    this.conformPropertiesToServer(this.rivalHero);
    this.myHero.getComponent(Hero).updateProgressBar();
    this.rivalHero.getComponent(Hero).updateProgressBar();
  }

  playAttackAnim(hero: cc.Node) {
    const anim = hero.getComponent(cc.Animation);
    const attackName = hero.name + 'Attack';
    anim.playAdditive(attackName);
    return anim;
  }

  playDefendAnim(hero: cc.Node) {
    const anim = hero.getComponent(cc.Animation);
    const defendName = hero.name + 'Defend';
    anim.playAdditive(defendName);
    return anim;
  }

  playActions() {
    if (this.myHero.getComponent(Hero).properties.speed >= this.rivalHero.getComponent(Hero).properties.speed) { // 我的速度快，我先行动
      this.heroAct(this.myHero, this.rivalHero);
      setTimeout(() => {
        this.heroAct(this.rivalHero, this.myHero);
      }, this.animTime);

    } else { // 对手速度快，对手先行动
      this.heroAct(this.rivalHero, this.myHero);
      setTimeout(() => {
        this.heroAct(this.myHero, this.rivalHero);
      }, this.animTime);
    }
  }

  attack(fromHero: cc.Node, toHero: cc.Node) {
    if (fromHero.getComponent(Hero).properties.isMoveAttack) {
      if (toHero.x < 0) {
        fromHero.x = toHero.getBoundingBox().xMax - fromHero.width / 2;
      } else {
        fromHero.x = toHero.getBoundingBox().xMin + fromHero.width / 2;
      }
    }

    const fromAnim = this.playAttackAnim(fromHero);
    this.playDefendAnim(toHero);

    fromAnim.once('finished', () => {
      if (fromHero.getComponent(Hero).properties.isMoveAttack) {
        fromHero.x = fromHero.getComponent(Hero).properties.originLocationX;
      }

      // toHero 掉血
      const toChoice = this.choices[toHero.name];

      if (toChoice !== DEFEND_ACTION) {
        toHero.getComponent(Hero).properties.currentBloodValue -= fromHero.getComponent(Hero).properties.attackValue;

      } else {
        if (toHero.getComponent(Hero).properties.defendValue < fromHero.getComponent(Hero).properties.attackValue) {
          const toHerobloodValue = toHero.getComponent(Hero).properties.currentBloodValue;
          const toHeroDefendValue = toHero.getComponent(Hero).properties.defendValue;
          toHero.getComponent(Hero).properties.currentBloodValue = toHerobloodValue + toHeroDefendValue - fromHero.getComponent(Hero).properties.attackValue;
        }
      }

      // 更新 to 的进度条
      toHero.getComponent(Hero).updateProgressBar();
    }, this)

  }

  defend(hero: cc.Node) {

  }

  restore(hero: cc.Node) {
    const newBloodValue = hero.getComponent(Hero).properties.currentBloodValue + hero.getComponent(Hero).properties.restoreValue;

    if (newBloodValue > hero.getComponent(Hero).properties.totalBloodValue) {
      hero.getComponent(Hero).properties.currentBloodValue = hero.getComponent(Hero).properties.totalBloodValue;
    } else {
      hero.getComponent(Hero).properties.currentBloodValue = newBloodValue;
    }

    hero.getComponent(Hero).updateProgressBar();
  }

  heroAct(firstHero: cc.Node, secondHero: cc.Node) {
    if (firstHero.getComponent(Hero).properties.currentBloodValue > 0) {
      switch (this.choices[firstHero.name]) {
        case ATTACK_ACTION:
          this.attack(firstHero, secondHero);
          break;
        case DEFEND_ACTION:
          this.defend(firstHero);
          break;
        case RESTORE_ACTION:
          this.restore(firstHero);
          break;
        default:
          break;
      }
    }
  }


  heroDefaultAnim(hero: cc.Node) {
    const myHeroAnim = hero.getComponent(cc.Animation);
    const animDefaultClipName = hero.name + 'Default';
    const myHeroDefaultAnim = myHeroAnim.playAdditive(animDefaultClipName)
    myHeroDefaultAnim.wrapMode = cc.WrapMode.Loop;
    myHeroDefaultAnim.repeatCount = Infinity;
  }

  gameOver() {
    this.myHero.active = false;
    this.rivalHero.active = false;
    this.hideActionButtons();

    // this.gameOverNode.getComponent(GameOver).showGameOver('游戏结束');
    // this.gameOverNode.active = true;
    this.gameResultLabel.string = '游戏结束'
    this.gameResultLabel.node.active = true;
    this.backButton.node.active = true;
  }

  hideActionButtons() {
    this.attackButton.node.active = false;
    this.defendButton.node.active = false;
    this.restoreButton.node.active = false;
  }

  showButtons() {
    this.attackButton.node.active = true;
    this.defendButton.node.active = true;
    this.restoreButton.node.active = true;
  }
}
