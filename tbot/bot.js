import {LogsKeyboard, MultiPanelMenu, MultiPanelOther, PanelMenuKeyboard, PortalMenuKeyboardMW, PortalMenuKeyboardCM, PortalMenuKeyboardMB, PortalMenuKeyboardMP, ServerMenuKeyboard} from "./keyboards.js";
import {botsObj, botsObjData} from "../index.js";
import {_admins, _DEFAULT_TOKEN} from "../config/cfg.js";
import TelegramBot from "node-telegram-bot-api";
import {EventEmitter} from "events";
import {rename} from "fs";


export class TBot extends EventEmitter {
  call;
  data;
  chat;
  msg;

  constructor(options) {
    super();
    this.data = {};
    this.options = options || {};
    this.admins = this.options.admins || _admins;
    this.id = 6237798050;
    this.curSenders = [];
    this.args = [];
    this.token = this.options.token || _DEFAULT_TOKEN;
    this.bot = new TelegramBot(this.token, { polling: true });
    this.on("error", console.log);
    // this.commands();
    // this.callbackCommands();
    // this.messageEvents();
    this.onCommand("/on", () => {
      const portal = this.args[0];
      if (Object.keys(botsObjData).includes(portal)) {
        botsObj[portal] = botsObjData[portal]();
        this.sendMessage(`Бот запущен на ${portal}!`);
      } else {
        this.sendMessage(`Не удалость запустить бота на ${portal}!`);
      }
    }, {
      args: 1
    });

    this.onCommand("/off", () => {
      const portal = this.args[0];
      if (Object.keys(botsObjData).includes(portal) && botsObj[portal]) {
        botsObj[portal].deleteBot();
        botsObj[portal] = null;
        this.sendMessage(`Бот остановлен на ${portal}!`);
      } else {
        this.sendMessage(`Не удалость остановить бота на ${portal}!`);
      }
    }, {
      args: 1
    });
    console.log("Start!");
  };
  
  sendMessage(message) {
    try {
      return this.bot.sendMessage(this.id, message).then(function(resp) {}).catch(function(error) {});
    } catch (err) {}
  };
  
  // sendInlineKBMessage(message, keyboard) {
  //   try {
  //     return this.bot.sendMessage(this.id, message, {
  //       reply_markup: JSON.stringify({inline_keyboard: keyboard}),
  //     });
  //   } catch (err) {}
  // };
  
  onCommand(command, callback, options = {}) {
    this.bot.onText(new RegExp(command), async (msg) => {
      try {
        if (this.admins.includes(msg.chat.id)) {
          this.msg = msg;
          this.id = this.msg.chat.id;
          if (options?.args > 0) {
            if (options.args > 0) {
              if (!options.argErrMsg) options.argErrMsg = `Ошибка аргументов!\nНужно ${options.args}, когда передано ${this.args.length}!`;
              this.args = this.msg.text.split(" ").slice(1);
              if (this.args.length === options.args) return callback();
              return await this.sendMessage(options.argErrMsg);
            }
          }
          return callback();
        }
        await this.sendMessage("Неуполномоченный!");
      } catch (err) {
        console.log(err);
      }
    });
  };
  
  // commands() {
  //   this.botOn("message", async (msg) => {
  //     const status = this.data[this.id]["status"];
  //     if (status == null) return;
  //     this.msg = msg;
  //     this.id = this.msg.chat.id;
  //     this.emit(status, msg);
  //     this.clearStatus();
  //   });
  //   this.onCommand("/start", async () => await this.sendMessage(`Привет, ${this.msg.from.first_name}!\nЭто админ панель великого лурика!\nЖми /menu и админь!`));
  //   this.onCommand("/menu", async () => await this.sendInlineKBMessage(`😭 Выбери сервер 😭`, ServerMenuKeyboard));
  //   this.onCommand("/enable", async () => {
  //     const bot = botsObj[this.data[this.id]["server"]][this.data[this.id]["portal"]].bot;
  //     if (!bot) return await this.sendMessage("Сначала включите этого бота!");
  //     this.data[this.id]["log"] = true;
  //     bot.enableLog();
  //     await this.sendMessage("Логи включены!");
  //   });
    
  //   this.onCommand("/disable", async () => {
  //     const bot = botsObj[this.data[this.id]["server"]][this.data[this.id]["portal"]].bot;
  //     if (!bot) return await this.sendMessage("Сначала включите этого бота!");
  //     this.data[this.id]["log"] = false;
  //     bot.disableLog();
  //     await this.sendMessage("Логи выключены!");
  //   });
  // }
  
  // callbackCommands() {
  //   this.botOn("callback_query", async (call) => {
  //     try {
  //       this.call = call;
  //       this.id = this.call.from.id
  //       this.emit(call.data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   });
    
  //   this.on("log", async (sendMsg, type, portal) => {
  //     if (this.data[this.id]["portal"] === portal) {
  //       this.curSenders = Object.keys(this.data);
  //       for (const id of this.curSenders) {
  //         this.id = id;
  //         await this.sendMessage(sendMsg);
  //       }
  //     }
  //   });
    
  //   this.on("sendmsg", async () => {
  //     if (botsObj[this.data[this.id]["server"]][this.data[this.id]["portal"]]) {
  //       await this.sendMessage("Отправьте сообщение!");
  //       this.setStatus("chat");
  //     }
  //   });
    
  //   this.on("masedworld", async () => {
  //     this.sendInlineKBMessage(`👀 Выбери сервер 👀`, PortalMenuKeyboardMW);
  //     this.data[this.id]["server"] = "masedworld";
  //   });
    
  //   this.on("cheatmine", async () => {
  //     this.sendInlineKBMessage(`👀 Выбери сервер 👀`, PortalMenuKeyboardCM);
  //     this.data[this.id]["server"] = "cheatmine";
  //   });
    
  //   this.on("mineblaze", async () => {
  //     this.sendInlineKBMessage(`👀 Выбери сервер 👀`, PortalMenuKeyboardMB);
  //     uthis.data[this.id]["server"] = "mineblaze";
  //   });
    
  //   this.on("multipanel", async () => {
  //     this.sendInlineKBMessage(`👀 Выбери действие 👀`, PortalMenuKeyboardMP);
  //   });
    
  //   this.on("s1", async () => this.setPortal("s1"));
  //   this.on("s2", async () => this.setPortal("s2"));
  //   this.on("s3", async () => this.setPortal("s3"));
  //   this.on("s4", async () => this.setPortal("s4"));
  //   this.on("s5", async () => this.setPortal("s5"));
  //   this.on("s6", async () => this.setPortal("s6"));
  //   this.on("s7", async () => this.setPortal("s7"));
  //   this.on("s8", async () => this.setPortal("s8"));
  //   this.on("s9", async () => this.setPortal("s9"));
  //   this.on("s10", async () => this.setPortal("s10"));
    
  //   this.on("enable", async () => {
  //     try {
  //       botsObj[
  //         this.data[this.id]["server"]
  //       ][
  //         this.data[this.id]["portal"]
  //       ] = startByServer(
  //         this.data[this.id]["server"],
  //         this.data[this.id]["portal"],
  //       );
  //     } catch (err) {
  //       if (err instanceof TypeError) this.sendMessage("Ошибка! Сначала выберите сервер и портал -> /menu");
  //       else console.log(err);
  //     }
  //   });
    
  //   this.on("disable", async () => {
  //     if (botsObj[
  //       this.data[this.id]["server"]
  //     ][
  //       this.data[this.id]["portal"]
  //     ]) {
  //       botsObj[
  //         this.data[this.id]["server"]
  //       ][
  //         this.data[this.id]["portal"]
  //       ].deleteBot();
  //     }
      
  //     botsObj[
  //       this.data[this.id]["server"]
  //     ][
  //       this.data[this.id]["portal"]
  //     ] = null;
  //   });
    
  //   this.on("multimw", async () => {
  //     this.data[this.id]["server"] = "masedworld";
  //     this.sendInlineKBMessage(`👀 Выбери действие 👀`, MultiPanelMenu);
  //   });
    
  //   this.on("multicm", async () => {
  //     this.data[this.id]["server"] = "cheatmine";
  //     this.sendInlineKBMessage(`👀 Выбери действие 👀`, MultiPanelMenu);
  //   });
    
  //   this.on("multimb", async () => {
  //     this.data[this.id]["server"] = "mineblaze";
  //     this.sendInlineKBMessage(`👀 Выбери действие 👀`, MultiPanelMenu);
  //   });
    
  //   this.on("multiother", async () => {
  //     this.sendInlineKBMessage(`👀 Выбери действие 👀`, MultiPanelOther);
  //   });
    
  //   this.on("logs", async () => {
  //     this.sendInlineKBMessage(`👀 Выбери действие 👀`, LogsKeyboard);
  //   });
    
  //   this.on("sendmsgall", async () => {
  //     await this.sendMessage("Напишите сообщение:");
  //     this.setStatus("postmsgall");
  //   });
    
  //   this.on("enableall", async () => {
  //     await this.sendMessage("Включаю всех ботов...");
  //     for (let i = 0; i < botsObj[this.data[this.id]["server"]].length; i++) {
  //       const portal = `s${i + 1}`;
  //       if (botsObj[this.data[this.id]["server"]][portal]) continue;
  //       botsObj[this.data[this.id]["server"]][this.data[this.id]["portal"]] = botsObjData[this.data[this.id]["server"]][this.data[this.id]["portal"]];
  //     }
  //     await this.sendMessage("Все боты включены!");
  //   });
    
  //   this.on("disableall", async () => {
  //     await this.sendMessage("Выключаю всех ботов...");
  //     for (let i = 0; i < botsObj[this.data[this.id]["server"]].length; i++) {
  //       const portal = `s${i + 1}`;
  //       if (botsObj[this.data[this.id]["server"]][portal]) continue;
  //       botsObj[this.data[this.id]["server"]][portal].bot.deleteBot();
  //       botsObj[this.data[this.id]["server"]][portal] = null;
  //     }
  //     await this.sendMessage("Все боты выключены!");
  //   });
    
  //   this.botOn("document", async (msg) => {
  //     this.msg = msg;
  //     this.emit("document");
  //   });
    
  //   this.on("downloadbl", async () => this.sendFile("data/blacklist.txt"));
    
  //   this.on("downloaddeaths", async () => this.sendFile("data/deaths.json"));
    
  //   this.on("uploadbl", async () => await this.fileUploader("blacklist.txt"));
    
  //   this.on("uploaddeaths", async () => await this.fileUploader("deaths.json"));
    
  //   this.on("downloadlog", async () => this.sendFile(`data/logs/${this.data[this.id]["server"]}/${this.data[this.id]["portal"]}`));
    
    
  //   this.on("uploadgllog", async () => await this.fileUploader("GlobalLog", `data/logs/${this.data[this.id]["server"]}/${this.data[this.id]["portal"]}`));
    
  //   this.on("uploadllog", async () => await this.fileUploader("LocalLog", `data/logs/${this.data[this.id]["server"]}/${this.data[this.id]["portal"]}`));
    
  //   this.on("uploadcllog", async () => await this.fileUploader("ClanLog", `data/logs/${this.data[this.id]["server"]}/${this.data[this.id]["portal"]}`));
  // };

  // on(event, callback) {
  //   super.on(event, () => {
  //     if (!this.data[this.id]) this.data[this.id] = {
  //       "status": null,
  //       "server": null,
  //       "portal": null,
  //       "log": false,
  //     };
  //     callback();
  //   });
  // };

  // botOn(event, callback) {
  //   this.bot.on(event, (...args) => {
  //     if (!this.data[this.id]) this.data[this.id] = {
  //       "status": null,
  //       "server": null,
  //       "portal": null,
  //       "log": false,
  //     };
  //     callback(...args);
  //   });
  // };

  // messageEvents() {
  //   this.onStatus("chat", async () => {
  //     const curBot = botsObj[this.data[this.id]["server"]][this.data[this.id]["portal"]];
      
  //     if (curBot) {
  //       curBot.bot.sendMsg(this.msg.text);
  //       await this.sendMessage(`Отправлено сообщение: ${this.msg.text}`);
  //     } else await this.sendMessage("Запустите бота!");
  //   });
      
  //     this.onStatus("postmsgall", async () => {
  //       const server = this.data[this.id]["server"];
  //       for (let i = 0; i < botsObj[server].length; i++) {
  //         const portal = `s${i + 1}`;
  //         if (botsObj[server][portal]) botsObj[server][portal].sendMsg(this.msg.text);
  //       }
  //       await this.sendMessage(`На ${server.toUpperCase()} отправлено сообщение: ${this.msg.text}`);
  //     });
  // };
  
  // setStatus(status) {
  //   this.data[this.id]["status"] = status;
  // };
  
  // clearStatus() {
  //   this.setStatus(null);
  // };
  
  // onStatus(event, callback) {
  //   this.on(event, (msg) => {
  //     this.msg = msg;
  //     this.id = this.msg.chat.id;
  //     callback();
  //   });
  // };
  
  // setPortal(portal) {
  //   try {
  //     this.data[this.id]["portal"] = portal;
  //     this.sendInlineKBMessage(`Онлайн: ${
  //       (botsObj[this.data[this.id]["server"]][this.data[this.id]["portal"]]) ?
  //       "Онлайн" : "Оффлайн"
  //     }`, PanelMenuKeyboard);
  //   } catch (err) {
  //     this.sendMessage("Ошибка! Сначала выберите сервер -> /menu");
  //   }
  // };
  
  // sendFile(path) {
  //   try {
  //     return this.bot.sendDocument(this.id, path, {}, {contentType: "application/octet-stream"});
  //   } catch (err) {}
  // };
  
  // async fileUploader(filename, path = "data") {
  //   await this.sendMessage("Отправьте файл!");
  //   const callback = async () => {
  //     try {
  //       if (this.msg.document) {
  //         await this.bot.downloadFile(this.msg.document.file_id, path).then((value) => rename(`${value}`, `${path}/${filename}`, () => {}));
  //         await this.sendMessage("Файл успешно загружен!")
  //       }
  //       this.removeListener("document", callback);
  //     } catch (err) {}
  //   }
  //   this.on("document", callback);
  // };
};
