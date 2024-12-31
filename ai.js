import {AiStartMessage, AiToken, formatedPortals, formatedServers} from "./config/cfg.js";
import {getCurrentDate, splitStringIntoList} from "./config/func.js";
import {HfInference} from "@huggingface/inference";
import {botsObj} from "./index.js";


export class Ai {
  answerCheck;
  completion;
  messages;
  answer;

  constructor() {
    this.client = new HfInference(AiToken);
    this.canAnswer = true;
    this.resetMessages();
    setInterval(() => this.resetMessages(), 30 * 60 * 1000);
  }

  async getAnswer(question, botData) {
    try {
      if (question.trim() === "") return;
      if (!this.messages[botData.player] || this.messages[botData.player] == []) {
        this.messages[botData.player] = [{
          role: "system",
          content: AiStartMessage,
        }];
      }
      else if (this.messages[botData.player].length >= 15)
      this.messages[botData.player].push({
        role: "system",
        content: `Your current nickname: ${botData.nickname}.
				Your current portal: ${formatedPortals[botData.server][botData.portal]}.
				Your current server: ${formatedServers[botData.server]}.
				Your current interlocutor: ${botData.player}.
				Current time: ${getCurrentDate()}.
        YOU ARE STRICTLY FORBIDDEN TO INSULT ANYONE OR ASK ANYONE TO LEAVE THE SERVER, PROJECT OR ANYTHING ELSE
        `,
        // YOUR MAXIMUM ANSWER LENGTH: 200 CHARACTERS.
      });
      this.messages[botData.player].push({
        role: "user",
        content: question,
      });
      this.completion = await this.client.chatCompletion({
        model: "Qwen/QwQ-32B-Preview",
        messages: this.messages[botData.player],
        max_tokens: 512,  // 250
        temperature: 0.5,
      });
      this.answer = this.completion.choices[0].message.content;
      this.messages[botData.player].push({
        role: "assistant",
        content: this.answer,
      });
      const waitForAnswer = () => {
        return new Promise((resolve) => {
          const checkAnswer = () => {
            if (typeof this.answer === "string") resolve(this.answer);
            else setTimeout(checkAnswer, 100);
          };
          checkAnswer();
        });
      };
      waitForAnswer().then((finalAnswer) => {
        const userMsg = this.messages[botData.player].pop();
        this.messages[botData.player].pop();
        this.messages[botData.player].push(userMsg);

        this.messages[botData.player].push({
          role: "assistant",
          content: finalAnswer,
        });
        this.aiAnswer(finalAnswer, botData.server, botData.portal);
      });      
    } catch (err) {
      this.canAnswer = true;
      console.log(err);
    }
  };

  aiAnswer(answer, server, portal) {
    // botsObj[server][portal].sendMsg(`/cc ${answer}`);
    // this.canAnswer = true;
    const strs = splitStringIntoList(answer);
    setTimeout(() => {
      for (let i = 0; i < strs.length; i++) {
        if (botsObj[server][portal]?.sendMsg !== null) {
          setTimeout(() => {
            botsObj[server][portal].sendMsg(`/cc ${strs[i]}`);
          }, (i + 1) * 500);
        }
      }
      this.canAnswer = true;
    }, 1000);
  };

  resetMessages() {
    this.messages = {};
  };
};


export const ai = new Ai();
