import { Logger, LogLevel } from "bot-framework";
import { CommandBuilder, CommandProvider } from "bot-framework/discord";
import { ChatInputCommandInteraction, escapeMarkdown, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { replyWithEmbed } from "fumi/utils/bot_utils.js";

export class ChooseCommand implements CommandProvider<ChatInputCommandInteraction> {

  logger: Logger;

  constructor() {
    this.logger = new Logger("ChooseCommand");
  }

  provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName("choose")
        .setDescription("Choose a random option out of multiple provided")
        .addStringOption(
          new SlashCommandStringOption()
          .setName("options")
          .setDescription("Options separated by semi-colons or commas")
          .setRequired(true)) as unknown as CommandBuilder
    ]
  }

  provideHelpMessage(): string {
    return "/choose <option>[,<option>] - Choose a random option out of multiple provided";
  }

  async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const options = interaction.options.getString('options').split(/[;,]/).map(o => escapeMarkdown(o));
    const chosenOption = options[Math.floor(Math.random() * options.length)];

    replyWithEmbed(interaction, [
      { name: "Choices", value: options.join(", ") },
      { name: "Chosen", value: chosenOption }
    ], this.logger, `Chosen out of ${options.length} choices`, LogLevel.TRACE);
  }

}