import {BlacklistPath, DeathsPath, ProxyPath} from "./config/cfg.js";
import {readFileSync, writeFileSync} from "fs";
import {startBans} from "./bot/ban/ban.js";
import {MWBot} from "./bot/masedworld.js";
import {randInt} from "./config/func.js";
import {TBot} from "./tbot/bot.js";

export let playerDeaths;
export let blacklist;
export let botList = [];
export const botsObjData = {
  "masedworld": {
    "s1": () => { return startBotMW({nickname: "VectorKemper1ng", portal: "s1"}) },
    "s2": () => { return startBotMW({nickname: "Kemper1ng", portal: "s2"}) },
    "s3": () => { return startBotMW({nickname: "NeoKemper1ng", portal: "s3"}) },
    "s4": () => { return startBotMW({nickname: "SCPbotSH", portal: "s4"}) },
    "s5": () => { return startBotMW({nickname: "Alfhelm", portal: "s5"}) },
    "s6": () => { return startBotMW({nickname: "QuaKemper1ng", portal: "s6"}) },
    "s7": () => { return startBotMW({nickname: "AntiKemper1ng", portal: "s7"}) },
    "s8": () => { return startBotMW({nickname: "Temper1ng", portal: "s8"}) },
  },
};
export let botsObj = {
  "masedworld": {
    "s1": null,
    "s2": null,
    "s3": null,
    "s4": null,
    "s5": null,
    "s6": null,
    "s7": null,
    "s8": null,
  },
};
loadBlacklist();
loadDeaths();


export function saveBlacklist() {
  writeFileSync(BlacklistPath, blacklist.join("\n"));
};  


export function loadBlacklist() {
  try {
    blacklist = readFileSync(BlacklistPath).toString().split("\n");
  } catch (err) {
    if (err.code === "ENOENT") blacklist = [];
  }
};


export function saveDeaths() {
  writeFileSync(DeathsPath, JSON.stringify(playerDeaths));
};


export function loadDeaths() {
  try {
    playerDeaths = JSON.parse(readFileSync(DeathsPath).toString());
  } catch (err) {
    if (err.code === "ENOENT") playerDeaths = {};
  }
};


export function startBotMW(options = {
  nickname: "Kemper1ng",
  portal: "s2",
}) {
  return new MWBot(options);
};


export function startBotCM(options) {
  options.nickname = options.nickname || "Tramp2024";
  options.portal = options.portal || "s1";
  return new CMBot(options);
};


export function startBotMB(options) {
  options.nickname = options.nickname || "lohkgwg1";
  options.portal = options.portal || "s1";
  return new MBBot(options);
};


export function startByServer(server, portal,) {
  if (botsObjData?.[server]?.[portal] && typeof botsObjData[server][portal] === "function") return botsObjData[server][portal]();
  else {
    console.log(server, portal);
    return null;
  }
};


export function getRandomProxy() {
  const proxies = readFileSync(ProxyPath, "utf-8").split("\n").filter(line => line.trim() !== "");
  return proxies[randInt(0, proxies.length)];
};


export let tbot = new TBot();
// startBans();
