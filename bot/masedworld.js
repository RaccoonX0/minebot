import {adMsgs, commandsMsgs} from "../config/cfg.js";
import {randInt} from "../config/func.js";
import {MainBot} from "./main.js";


export class MWBot extends MainBot {
  constructor(options) {
    super(options, "masedworld", false);
    this.matchCmdPattern = /›\s*\[\s*(.*)\s*->\s*я]\s*(.*)/;
    this.matchKdrPattern = /(.*?)\s*убил игрока\s*(.*)/;
    this.matchLeavePattern = /›\s*(.*)\s*покинул клан\./;
    this.matchJoinPattern = /›\s*(.*)\s*присоеденился\s*к\s*клану\./;
  };

  sendAdvertisements() {
    super.sendAdvertisements();
    setInterval(() => this.sendMsg(adMsgs[randInt(0, adMsgs.length - 1)]), randInt(2.1*60*1000, 3*60*1000));
    setInterval(() => this.sendMsg(commandsMsgs["discord"]), randInt(60*1000, 2*60*1000));
  };

  processChatMessage() {
    super.processChatMessage();

    if (this.textMessage.startsWith("[ʟ]") || this.textMessage.startsWith("[ɢ]")) {
      try {
        this.username = this.message.json.extra[0].clickEvent.value.split(" ")[1];
      } catch (err) {
        return;
      };
      const index = this.cmdMessages.indexOf("⇨");

      if (index !== -1) {
        this.cmdMessages[index-1] = this.username;
        this.textMessage = this.cmdMessages.join(" ");
      };
    };
  };
};
