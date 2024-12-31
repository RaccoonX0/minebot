import {adMsgs, commandsMsgs} from "../config/cfg.js";
import {randInt} from "../config/func.js";
import {MainBot} from "./main.js";


export class CMBot extends MainBot {
  constructor(options) {
    super(options, "cheatmine", true);
    this.matchCmdPattern = /]\s*(.*?)\s*->.*?]\s*(.*)/;
    this.matchKdrPattern = /(.*?) убил игрока (.*)'/;
    this.matchLeavePattern = /\[\*]\s*(.*?)\s*покинул/;
    this.matchJoinPattern = /\[\*]\s*(.*?)\s*присоеденился/;
  };

  sendAdvertisements() {
    super.sendAdvertisements();
    setInterval(() => this.sendMsg(adMsgs[randInt(0, adMsgs.length - 1)]), randInt(40*1000, 60*1000));
    setInterval(() => this.sendMsg(commandsMsgs["discordlink"]), randInt(60*1000, 2*60*1000));
  };

  processChatMessage() {
    super.processChatMessage();

    if (this.textMessage.startsWith("[ʟ]") || this.textMessage.startsWith("[ɢ]")) {
      try {
        this.username = this.message.json.extra[0].clickEvent.value.split(" ")[1];
      } catch (err) {};
      this.cmdMessages[2] = `${this.username} ⇨`;
      this.textMessage = this.cmdMessages.join(" ");
    };
  };

  lookAtNearestPlayer() {
    super.lookAtNearestPlayer();

    setInterval(() => {
      try {
        const entity = this.bot.nearestEntity(entity => entity.type === "player");
        if (entity) return this.bot.lookAt(entity.position.offset(0, entity.height, 0), false);
      } catch (err) {};
    }, 100);
  };
};
