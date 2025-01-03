import {HttpProxyAgent} from "http-proxy-agent";
import {getRandomProxy} from "../../index.js";
import {createBot} from "mineflayer";
import {readFileSync} from "fs";
import { version } from "os";


let banList = [];
let botList = [];


function getBans() {
  try {
    banList = readFileSync("bot/ban/bans.txt", "utf-8").toString().split("\n").filter(el => el.trim() !== "");
  } catch (err) {
    if (err.code === "ENOENT") botList = [];
    console.log(err);
  }
};


export function startBans() {
  getBans();
  if (banList == []) return;
  else if (banList.forEach) console.log(`Banning: ${banList}`);

  banList.forEach(nickname => {
    botList.push(new BanBot({
      nickname: nickname,
      server: "masedworld",
    }));
  });
};


class BanBot {
  constructor(options) {
    this.options = options;
    this.nickname = options.nickname;
    this.host = `ru.${options.server}.net`;
    this.startBot = () => {
      if (this.bot) {
        this.bot.end();
        this.bot = null;
      }
      this.agent = new HttpProxyAgent(`http://${getRandomProxy()}`);
      this.botOptions = {
        username: this.nickname,
        host: this.host,
        version: "1.19.4",
        agent: this.agent
      };
  
      this.bot = createBot(this.botOptions);
      this.bot.setMaxListeners(1000);
  
      this.bot.on("error", console.log);
      this.bot.on("end", this.reconnectBot);
      this.bot.on("spawn", this.handleSpawn);
    };
    this.startBot();
  };
  
  handleSpawn() {
    console.log(`${this.nickname} - Spawned...`);
    setTimeout(() => {
      try {
        this.bot.end("restart");
      } catch (err) {}
    }, 60 * 1000);
  };

  reconnectBot(reason) {
    try {
      if (reason === "stop") return console.log(`${this.nickname} - Disconnection... (${reason})`);
      this.startBot();
    } catch (err) {}
  };
};
