import {admins, FreezeTrollMsg, PatternOptions, PublicName, PublicPassword, PublicSkin, PublicVersion, PublicWarp, PublicPlugins} from "../config/cfg.js";
import {blacklist, playerDeaths, botList, saveBlacklist, saveDeaths, getRandomProxy, botsObj, tbot, startByServer} from "../index.js";
import {appendFile, existsSync, mkdirSync, writeFileSync} from "fs";
import {HttpProxyAgent} from "http-proxy-agent";
import {randInt} from "../config/func.js";
import {Base} from "./commands.js";
import * as mf from "mineflayer";
import {ai} from "../ai.js";


export class MainBot extends Base {
  matchLeavePattern;
  matchJoinPattern;
  matchClanPattern;
  matchCmdPattern;
  matchKdrPattern;
  textMessage;
  cmdMessages;
  username;
  message;

  constructor(options, server, enableLooking) {
    super();
    this.matchClanPattern = /^КЛАН: .*? (.*?): (.*)$/;
    this.endCount = 0;
    this.spawnCount = 0;
    this.nickname = options.nickname;
    this.portal = options.portal;
    this.options = options;
    this.password = PublicPassword;
    this.version = PublicVersion;
    this.warp = PublicWarp;
    this.skin = PublicSkin;
    this.name = PublicName;
    this.host = `ru.${server}.net`;
    this.server = server;
    this.lastUser = "";
    this.currentArg = "";
    this.allArgs = [];
    if (botsObj[this.server][this.portal]) return;
    this.botOptions = {
      username: this.nickname,
      host: this.host,
      agent: this.agent,
      version: this.version,
      plugins: PublicPlugins,
    };
    botList.push(this.nickname);
    this.agent = new HttpProxyAgent(`http://${getRandomProxy()}`);
    this.bot = mf.createBot(this.botOptions);
    this.bot.setMaxListeners(1000);
    this.setMaxListeners(1000);
    this.bot.on("end", (reason) => this.reconnectBot(reason));
    this.bot.on("error", (err) => console.log(err));
    this.bot.on("spawn", () => {
      this.spawnCount++;
      this.handleSpawn();
      if (this.spawnCount === 2) {
        this.bot.inventory.on("updateSlot", () => this.clearInventory());
        this.bot.on("message", (message) => this.messagesMonitoring(message));
        this.bot.on("entitySpawn", (entity) => entity?.username ? this.invite(entity.username) : {});
        this.bot.on("entityEffect", () => this.handleEffect());
        this.bot.on("forcedMove", () => this.antiTrap());
        this.bot.on("respawn", () => this.antiTrap());
        this.sendAdvertisements();
        this.setChatTriggers();
        this.invitePlayers();
        this.autoReconnect();
        this.setSkin();
        this.setName();
        this.tpWarp();
        this.fly();
        if (enableLooking) this.EnableLookAtNearestPlayer();
      }
    });
  };
  
  handleSpawn() {
    this.sendMsg(`/reg ${this.password}`);
    this.sendMsg(`/login ${this.password}`);
    this.sendMsg(`/${this.portal}`);
    this.antiTrap();
    console.log(`${this.nickname} has spawned`)
  };
  
  reconnectBot(reason = null) {
    try {
      if (this.bot) {
        this.end();
        this.bot = null;
      }
      botsObj[this.server][this.portal] = null;
      if (reason === "Disabled by admin") return console.log(`${this.nickname} - Disconnection... (${reason})`);
      console.log(`${this.nickname} - Reconnection... (${reason})`);
      botsObj[this.server][this.portal] = startByServer(this.server, this.portal);
    } catch (err) {
      botsObj[this.server][this.portal] = startByServer(this.server, this.portal);
      console.log(err);
    }
  };

  respawn() {
    this.bot._client.write("client_command", this.bot.supportFeature("respawnIsPayload") ? { payload: 0 } : { actionId: 0 });
  };
  
  sendMsg(msg) {
    try {
      if (typeof this.msg !== "string") msg = `${msg}`;
      else if (msg?.trim() == "") return;

      this.bot.chat(msg);
    } catch (err) {}
  };
  
  sendLocalMsg(msg, user = this.lastUser) {
    try {
      this.bot.chat(`/m ${user} ${msg}`);
    } catch (err) {}
  };
  
  tpWarp(warp = this.warp) {
    try {
      this.sendMsg(`/warp ${warp}`);
    } catch (err) {}
  };
  
  clearInventory() {
    this.sendMsg("/head remove")
    setTimeout(() => this.sendMsg("/clear"), 500);
  };
  
  writeLog() {
    const logText = `[${new Date().toLocaleString()}]: ${this.textMessage}\n`;
    const fullPath = `bot/data/logs/${this.server}/${this.portal}`;
    appendFile(fullPath, logText, (err) => {
      if (!err?.code) return;
      if (err.code === "ENOENT") {
        const pathParts = fullPath.split("/");
        let currentPath = "";
        for (let i = 0; i < pathParts.length - 1; i++) {
          currentPath += pathParts[i] + "/";
          if (!existsSync(currentPath)) mkdirSync(currentPath);
        }
        writeFileSync(fullPath, logText);
      }
    });
  };
  
  invitePlayers() {
    setInterval(() => {
      try {
        const closestPlayer = this.bot.nearestEntity(entity => entity.type === "player");
        if (closestPlayer && !blacklist.includes(closestPlayer.username)) this.inviteNearestPlayers();
      } catch (err) {}
    }, randInt(10000, 30000));
  };

  inviteNearestPlayers() {
    const entitesKeys = Object.keys(this.bot.entities);
    for (let i = 0; i < entitesKeys.length; i++) {
      const entity = this.bot.entities[entitesKeys[i]];
      if (entity.username) this.invite(entity.username);
    };
  };
  
  autoReconnect() {
    setInterval(() => {
      if (this.bot) this.end("Restart");
    }, 30 * 60 * 1000);
  };
  
  deleteBot() {
    this.end("Disabled by admin");
  };
  
  antiTrap() {
    try {
      this.respawn();
      this.tpWarp();
    } catch (err) {
      console.log(err)
    }
  };
  
  end(reason) {
    try {
      this.bot.end(reason);
      this.endCount = 0;
    } catch (err) {
      this.endCount++;
    }
  };
  
  sendAdvertisements() {};
  
  EnableLookAtNearestPlayer() {
    setInterval(() => {
      try {
        const entity = this.bot.nearestEntity(entity => entity.type === "player");
        if (entity) return this.bot.lookAt(entity.position.offset(0, entity.height, 0), false);
      } catch (err) {}
    }, 100);
  };
  
  handleEffect() {
    this.sendMsg("/heal");
    this.tpWarp();
  };

  invite(username) {
    if (username) this.sendMsg(`/c invite ${username}`);
  };
  
  setSkin(skin = this.skin) {
    this.sendMsg(`/skin ${skin}`);
  };
  
  setName(name = this.name) {
    this.sendMsg(`/nickname ${name}`);
  };
  
  fly() {
    this.sendMsg("/gm 1");
    this.bot.creative.startFlying();
  };
  
  messagesMonitoring(message) {
    this.message = message;
    this.textMessage = this.message.getText(null);
    this.cmdMessages = this.textMessage.split(" ");
    // console.log(this.textMessage);
    
    this.processChatMessage();
  };
  
  setChatTriggers() {
    this.bot.addChatPattern("cmd", this.matchCmdPattern, PatternOptions);
    this.bot.addChatPattern("kdr", this.matchKdrPattern, PatternOptions);
    this.bot.addChatPattern("join", this.matchJoinPattern, PatternOptions);
    this.bot.addChatPattern("leave", this.matchLeavePattern, PatternOptions);
    
    this.bot.addChatPattern("cc", this.matchClanPattern, PatternOptions);
    this.bot.addChatPattern("ft", FreezeTrollMsg, PatternOptions);
    
    this.bot.on("chat:cmd", match => {
      match = match[0];
      let messages = match[1].split(" ");
      this.allArgs = messages.slice(1);
      this.currentArg = this.allArgs[0];
      this.lastUser = match[0];
      this.processCommandMessage(this.lastUser, messages[0]);
    });

    this.bot.on("chat:kdr", match => {
      const killedPlayer = match[0][1];
      if (botList.includes(killedPlayer) || admins.includes(killedPlayer)) return;
      if (typeof playerDeaths[killedPlayer] !== "number") playerDeaths[killedPlayer] = 0;
      playerDeaths[killedPlayer] += 1;
      const deathsCount = playerDeaths[killedPlayer]
      if (deathsCount > 4) {
        this.sendMsg(`/c kick ${killedPlayer}`);
        blacklist.push(killedPlayer);
        saveBlacklist();
      }
      saveDeaths();
    });
    
    this.bot.on("chat:join", match => {
      const user = match[0][0];
      if (blacklist.includes(user) || (playerDeaths[user] && playerDeaths[user] > 4)) return this.sendMsg(`/c kick ${user}`);
      if (typeof playerDeaths[user] !== "number") playerDeaths[user] = 0;
      this.sendMsg(`/cc Добро пожаловать в клан, ${user}! Обязательно вступи в наш дискорд, там много всего интересного! Если хочешь вступить в наш дискорд сервер, то пиши мне - @thatsboring_`);
    });
    
    this.bot.on("chat:leave", match => {
      this.sendMsg(`/cc ${match[0][0]} выходит из клана, поймем но не простим!`);
    });
    
    this.bot.on("chat:cc", match => {
      match = match[0];
      const msg = match[1].split(" ");
      this.currentArg = msg[1];
      this.lastUser = match[0];
      this.allArgs = msg.slice(1);
      this.processClanMessage(msg[0].toLowerCase());
    });
    
    this.bot.on("chat:ft", () => this.end("Freeze troll"));
  };
  
  processChatMessage() {
    this.writeLog();
    if (this.textMessage.trim() !== "") this.emit("chatlog", this.textMessage);
  };
    
    processClanMessage(cmd) {
      if (cmd.startsWith("#")) {
        if (Object.keys(this.answerMessages).includes(cmd))this.sendMsg(this.answerMessages[cmd]);
      } else if (cmd.includes("бот")) {
        if (typeof this.answerMessages[cmd] === "function") {
          if (ai.canAnswer) {
            this.sendMsg("/cc Генерирую ответ...");
            this.answerMessages["бот"]();
            ai.canAnswer = false;
            return;
          }
          this.sendMsg("/cc Бот занят, попробуйте через пару секунд.");
          return;
        }
      }
    };
    
    processCommandMessage(username, command) {
      if (admins.includes(username.trim())) {
        if (Object.keys(this.adminAnswerMessages).includes(command)) {
          try {
            if (typeof this.adminAnswerMessages[command] === "function") {
              this.sendMsg(this.adminAnswerMessages[command]());
              return;
            }
            this.sendMsg(this.adminAnswerMessages[command]);
          } catch (err) {}
        }
      } else if (command === "#invite") this.invite(username);
    };
    
    enableLog() {
      this.on("chatlog", (message) => {
        try {
          tbot.emit("log", `[${this.portal}] [${new Date().toLocaleString()}] ${message}`, this.portal)
        } catch (err) {}
      });
    };
    
    disableLog() {
      try {
        this.removeListener("chatlog", () => {});
      } catch (err) {}
    };
}
