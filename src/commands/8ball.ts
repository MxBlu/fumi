import { Logger, LogLevel } from "bot-framework";
import { CommandBuilder, CommandProvider } from "bot-framework/discord";
import { ChatInputCommandInteraction, escapeMarkdown, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { replyWithEmbed } from "fumi/utils/bot_utils.js";

const EIGHTBALL_RESPONSES = [
  "Most definitely yes.",
  "For sure.",
  "Totally!",
  "Of course!",
  "As I see it, yes.",
  "My sources say yes.",
  "Yes.",
  "Most likely.",
  "Perhaps...",
  "Maybe...",
  "Hm, not sure.",
  "It is uncertain.",
  "Ask me again later.",
  "Don't count on it.",
  "Probably not.",
  "Very doubtful.",
  "Most likely no.",
  "Nope.",
  "No.",
  "My sources say no.",
  "Don't even think about it.",
  "Definitely no.",
  "NO - It may cause disease contraction!"
];

export class EightBallCommand implements CommandProvider<ChatInputCommandInteraction> {

  logger: Logger;

  constructor() {
    this.logger = new Logger("EightBallCommand");
  }

  provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Predict the future")
        .addStringOption(
          new SlashCommandStringOption()
          .setName("question")
          .setDescription("Question to divine")
          .setRequired(true)) as unknown as CommandBuilder
    ]
  }

  provideHelpMessage(): string {
    return "/8ball <question> - Predict the future";
  }

  async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = escapeMarkdown(interaction.options.getString('question'));
    const answer = EIGHTBALL_RESPONSES[Math.floor(Math.random() * EIGHTBALL_RESPONSES.length)];

    replyWithEmbed(interaction, [
      { name: question, value: answer }
    ], this.logger, `Answered 8-ball with ${answer}`, LogLevel.TRACE);
  }

}