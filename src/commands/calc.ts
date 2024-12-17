import { Logger, LogLevel } from "bot-framework";
import { CommandBuilder, CommandProvider, sendCmdReply } from "bot-framework/discord";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { evaluate } from "mathjs";

import { replyWithEmbed } from "fumi/utils/bot_utils.js";

export class CalcCommand implements CommandProvider<ChatInputCommandInteraction> {
  logger: Logger;

  constructor() {
    this.logger = new Logger("Commands.Calc");
  }

  provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName("calc")
        .setDescription("Calculate a value")
        .addStringOption(
          new SlashCommandStringOption()
          .setName("math")
          .setDescription("Calculations")
          .setRequired(true)) as unknown as CommandBuilder
    ]
  }

  provideHelpMessage(): string {
    return "/calc <math> - Calculate a value";
  }

  async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const math = interaction.options.getString('math');

    try {
      const result = evaluate(math);

      replyWithEmbed(interaction, [
          { name: math, value: `${result}` }
        ], this.logger, `Answered math equation: ${math}`, LogLevel.TRACE);
    } catch (_) {
      this.logger.debug(`Equation could not be calculated: ${math}`);
      sendCmdReply(interaction, `Invalid equation`, this.logger, LogLevel.DEBUG, { ephemeral: true });
      return;
    }
  }
}