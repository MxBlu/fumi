import { DiscordBot } from "bot-framework/discord";

class _Fumi extends DiscordBot {

  constructor() {
    super("Fumi");
  }

  protected getHelpMessage(): string {
    return "General purpose utility bot";
  }

}

export const Fumi = new _Fumi();