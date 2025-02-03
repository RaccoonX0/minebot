import {BlacklistPath, DeathsPath, ProxyPath} from "./config/cfg.js";
import {readFileSync, writeFileSync} from "fs";
import {MWBot} from "./bot/masedworld.js";
import {randInt} from "./config/func.js";
import {TBot} from "./tbot/bot.js";

export let playerDeaths;
export let blacklist;
export let botList = [];
export const botsObjData = {
  "s1": () => { return startBot({nickname: "VectorKemper1ng", portal: "s1"}) },
  "s2": () => { return startBot({nickname: "Kemper1ng", portal: "s2"}) },
  "s3": () => { return startBot({nickname: "SCPbotSH", portal: "s3"}) },
  "s4": () => { return startBot({nickname: "NeoKemper1ng", portal: "s4"}) },
  "s5": () => { return startBot({nickname: "Alfhelm", portal: "s5"}) },
  "s6": () => { return startBot({nickname: "QuaKemper1ng", portal: "s6"}) },
  "s7": () => { return startBot({nickname: "AntiKemper1ng", portal: "s7"}) },
  "s8": () => { return startBot({nickname: "Temper1ng", portal: "s8"}) },
};
export let botsObj = {
  "s1": null,
  "s2": null,
  "s3": null,
  "s4": null,
  "s5": null,
  "s6": null,
  "s7": null,
  "s8": null,
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


export function startBot(options = {
  nickname: "Kemper1ng",
  portal: "s2",
}) {
  return new MWBot(options);
};


export function getRandomProxy() {
  const proxies = readFileSync(ProxyPath, "utf-8").split("\n").filter(line => line.trim() !== "");
  return proxies[randInt(0, proxies.length)];
};


export let tbot = new TBot();
