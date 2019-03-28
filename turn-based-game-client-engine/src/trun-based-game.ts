import { autoDestroy, AutomaticGameEvent, Game, listen, watchRoomFull } from "@leancloud/client-engine";
import { Client, Event, Room, Player } from "@leancloud/play";

const ATTACK_ACTION = 1;
const DEFEND_ACTION = 2;
const RESTORE_ACTION = 3
/**
 * 回合制对战游戏
 */
@watchRoomFull()
@autoDestroy()
export default class TurnBasedGame extends Game {
  public static defaultSeatCount = 2;

  private choices: { [actorId: string] : number }  = {};

  constructor(room: Room, masterClient: Client) {
    super(room, masterClient);
    // 游戏创建后立刻执行的逻辑
    this.once(AutomaticGameEvent.ROOM_FULL, this.start);
  }

  public terminate() {
    // 将游戏 Room 的 open 属性标记为 false，不再允许用户加入了。
    this.masterClient.setRoomOpened(false);
    return super.terminate();
  }

  protected start = async () => {
    // 标记房间不再可加入
    await this.masterClient.setRoomOpened(false);
    // 设置玩家属性
    const playerABloodValue = Math.floor(Math.random() * 100) + 70;
    const playerAProps = {
      totalBloodValue: playerABloodValue,
      currentBloodValue: playerABloodValue,
      attackValue: Math.floor(Math.random() * 20) + 30,
      defendValue: Math.floor(Math.random() * 10) + 20,
      restoreValue: Math.floor(Math.random() * 20) + 20,
      speed: Math.floor(Math.random() * 20) + 80,
      isMoveAttack: false,
      heroName: 'HeroBull'
    }
    await this.players[0].setCustomProperties(playerAProps);

    const playerBBloodValue = Math.floor(Math.random() * 100) + 70;
    const playerBProps = {
      totalBloodValue: playerBBloodValue,
      currentBloodValue: playerBBloodValue,
      attackValue: Math.floor(Math.random() * 20) + 30,
      defendValue: Math.floor(Math.random() * 10) + 20,
      restoreValue: Math.floor(Math.random() * 10) + 20,
      speed: Math.floor(Math.random() * 20) + 80,
      isMoveAttack: true,
      heroName: 'HeroGirl'
    }
    await this.players[1].setCustomProperties(playerBProps);

    // 向客户端广播游戏开始事件
    await this.broadcast("game-start");

    this.masterClient.on(Event.CUSTOM_EVENT, async event => {
      const { eventId, eventData , senderId} = event;
      if (eventId === 'action') {
        if(!(String(senderId) in this.choices)) {
          this.choices[senderId] = eventData.action;
        }
        
        if (Object.keys(this.choices).length === 2) {
          await this.playActions();

          this.broadcast('begin-round-anim', this.choices);

          if (this.players[0].customProperties.currentBloodValue < 0) {
            this.masterClient.sendEvent('game-over', {winner: this.players[1].actorId});
          }

          if (this.players[1].customProperties.currentBloodValue < 0) {
            this.masterClient.sendEvent('game-over', {winner: this.players[0].actorId});
          }

          this.choices = {};
        }
  
      }
    });
  }

  private playActions = async () => {
    if (this.players[0].customProperties.speed >= this.players[1].customProperties.speed) {
      await this.calculateBlood(this.players[0], this.players[1]);
    } else {
      await this.calculateBlood(this.players[1], this.players[0]);
    }
  }

  private calculateBlood = async (firstPlayer:Player, secondPlayer:Player) => {
    if (firstPlayer.customProperties.currentBloodValue > 0) {
      switch (this.choices[firstPlayer.actorId]) {
        case ATTACK_ACTION:
          await this.attack(firstPlayer, secondPlayer);
          break;
        case DEFEND_ACTION:
          break;
        case RESTORE_ACTION:
          await this.restore(firstPlayer);
          break;
        default:
          break;
      }
    }
    
    if (secondPlayer.customProperties.currentBloodValue > 0) {
      switch (this.choices[secondPlayer.actorId]) {
        case ATTACK_ACTION:
          this.attack(secondPlayer, firstPlayer);
          break;
        case DEFEND_ACTION:
          break;
        case RESTORE_ACTION:
          this.restore(secondPlayer);
          break;
        default:
          break;
      }
    }
  }

  private attack = async (fromPlayer:Player, toPlayer:Player) => {
    let newBloodValue: number = 0;

    if (this.choices[toPlayer.actorId] === DEFEND_ACTION) {
      if (toPlayer.customProperties.defendValue < fromPlayer.customProperties.attackValue) {
        // toPlayer 防御力小于 fromPlayer 的攻击力
        newBloodValue = toPlayer.customProperties.currentBloodValue + toPlayer.customProperties.defendValue - fromPlayer.customProperties.attackValue;
        await toPlayer.setCustomProperties({currentBloodValue: newBloodValue});
      }
    } else {
      newBloodValue = toPlayer.customProperties.currentBloodValue - fromPlayer.customProperties.attackValue;
      await toPlayer.setCustomProperties({currentBloodValue: newBloodValue});
    }
  }

  private restore = async (player:Player) => {
    const newBloodValue = player.customProperties.currentBloodValue + player.customProperties.restoreValue;
    if (newBloodValue <= player.customProperties.totalBloodValue) {
      await player.setCustomProperties({currentBloodValue: newBloodValue});
    } else {
      await player.setCustomProperties({currentBloodValue: player.customProperties.totalBloodValue});
    }
  }
}
