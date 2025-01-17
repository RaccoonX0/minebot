import {commandsMsgs, unterMsgs} from "../config/cfg.js";
import {EventEmitter} from "events";
import {ai} from "../ai.js";


export class Base extends EventEmitter {
  constructor() {
    super();
    this.answerMessages = {
      //"afterdar": unterMsgs["afterdark"],
      //"worte": unterMsgs["wortex"],
      //"goldligh": unterMsgs["goldlight"],
      //"blyyet": unterMsgs["blyyeti"],
      //"helltea": unterMsgs["hellteam"],
      //"krist": unterMsgs["kristl"],
      
      "#команды": commandsMsgs["commandList"],
      "#списокботов": commandsMsgs["botList"],
      //"#союзы": commandsMsgs["allies"],
      //"#враги": commandsMsgs["enemies"],
      "#функции": commandsMsgs["functions"],
      "#версиибота": commandsMsgs["versions"][parseInt(this.currentArg)],
      "бот": () => {
        const ask = this.allArgs.join(" ");
        if (ask.trim() === "") return;
        ai.getAnswer(ask, {
          nickname: this.nickname,
          portal: this.portal,
          server: this.server,
          player: this.lastUser,
        }).then(() => {});
      },
    };

    
    this.adminAnswerMessages = {
      "#чс": () => {
        if (!blacklist.includes(this.currentArg)) {
          blacklist.push(this.currentArg);
          this.sendMsg(`/c kick ${this.currentArg}`);
          saveBlacklist();
          this.sendLocalMsg(`Игрок ${this.currentArg} добавлен в ЧС!`);
          loadBlacklist();
        } else this.sendLocalMsg(`Игрок ${this.currentArg} уже в ЧС!`);
      },
      "#анчс": () => {
        if (blacklist.includes(this.currentArg)) {
          blacklist = blacklist.filter(item => item !== this.currentArg);
          this.sendMsg(`/c invite ${this.currentArg}`);
          saveBlacklist();
          this.sendLocalMsg(`Игрок ${this.currentArg} удален из ЧС!`);
        } else this.sendLocalMsg(`Игрока ${this.currentArg} нету в ЧС!`);
      },
      "#чат": () => {
        this.sendMsg(this.allArgs.join(" "));
      },
      "#админ": () => {
        if (!admins.includes(this.currentArg)) {
          admins.push(this.currentArg);
          this.sendLocalMsg(`Теперь ${this.currentArg} админ!`);
        } else this.sendLocalMsg(`${this.currentArg} уже админ!`);
      },
      "#анадмин": () => {
        if (admins.includes(this.currentArg)) {
          admins[admins.indexOf(this.currentArg)] = "";
          this.sendLocalMsg(`Теперь ${this.currentArg} не админ!`);
        } else this.sendLocalMsg(`${this.currentArg} и так не админ!`);
      },
      "#рекконект": () => {
        this.sendLocalMsg("Рестарт...");
        this.end("Reconnect by admin.");
      },
    };
  };
};
