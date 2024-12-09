import { DiscordBot } from "bot-framework/discord";
import { EightBallCommand } from "fumi/commands/8ball.js";
import { ChooseCommand } from "fumi/commands/choose.js";

class _Fumi extends DiscordBot {

  constructor() {
    super("Fumi");
  }

  protected getHelpMessage(): string {
    return "General purpose utility bot";
  }

  protected loadProviders(): void {
    this.providers.push(new ChooseCommand());
    this.providers.push(new EightBallCommand());
  }
}

export const Fumi = new _Fumi();