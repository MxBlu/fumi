import { Dependency } from "bot-framework";
import { DiscordBot } from "bot-framework/discord";
import { EightBallCommand } from "fumi/commands/8ball.js";
import { CalcCommand } from "fumi/commands/calc.js";
import { ChooseCommand } from "fumi/commands/choose.js";
import { ConvertCommand } from "fumi/commands/convert.js";
import { CurrencyConversionDependency } from "fumi/utils/conversion.js";

class _Fumi extends DiscordBot {

  constructor() {
    super("Fumi");
  }

  public async init(discordToken: string): Promise<void> {
    // Wait for CurrencyConversion to be ready
    await CurrencyConversionDependency.await();

    await super.init(discordToken);
    // Mark bot as ready
    FumiDependency.ready();
  }

  protected getHelpMessage(): string {
    return "General purpose utility bot";
  }

  protected loadProviders(): void {
    this.providers.push(new ChooseCommand());
    this.providers.push(new EightBallCommand());
    this.providers.push(new ConvertCommand());
    this.providers.push(new CalcCommand());
  }
}

export const Fumi = new _Fumi();
export const FumiDependency = new Dependency("Fumi");