import { Logger, LogLevel } from "bot-framework";
import { CommandBuilder, CommandProvider, sendCmdReply } from "bot-framework/discord";
import convert from 'convert-units';
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption } from "discord.js";

import { replyWithEmbed } from "fumi/utils/bot_utils.js";
import { CurrencyConversion } from "fumi/utils/conversion.js";
import Fuse from "fuse.js";


export class ConvertCommand implements CommandProvider<ChatInputCommandInteraction> {
  logger: Logger;

  supportedUnits: Record<string, "currency" | "measure"> = {};

  unitSearch: Fuse<string>;

  constructor() {
    this.logger = new Logger("Commands.Convert");
    // Add the supported currencies in
    CurrencyConversion.getCurrencies().forEach(currency => {
      this.supportedUnits[currency] = "currency";
      this.supportedUnits[currency.toLowerCase()] = "currency";
    });
    // Add the supported measurements from convert-units in
    convert().possibilities().forEach(unit => {
      this.supportedUnits[unit] = "measure";
    })

    this.unitSearch = new Fuse(Object.keys(this.supportedUnits));
  }

  provideCommands(): CommandBuilder[] {
    const units = Object.keys(this.supportedUnits);
    return [
      new SlashCommandBuilder()
        .setName("convert")
        .setDescription("Convert from one unit or currency to another")
        .addNumberOption(
          new SlashCommandNumberOption()
          .setName("amount")
          .setDescription("Amount to convert")
          .setRequired(true))
        .addStringOption(
          new SlashCommandStringOption()
          .setName("from")
          .setDescription("Unit to convert from")
          .setAutocomplete(true)
          .setRequired(true))
        .addStringOption(
          new SlashCommandStringOption()
          .setName("to")
          .setDescription("Unit to convert to")
          .setAutocomplete(true)
          .setRequired(true)) as unknown as CommandBuilder
    ]
  }

  provideHelpMessage(): string {
    return "/convert <amount> <from> <to> - Choose a random option out of multiple provided";
  }

  async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getNumber('amount');
    const from = interaction.options.getString('from');
    const to = interaction.options.getString('to');

    // Check that units are supported for conversion
    if (this.supportedUnits[from] == null) {
      sendCmdReply(interaction, `Unknown unit: ${from}`, this.logger, LogLevel.DEBUG, { ephemeral: true });
      return;
    }
    if (this.supportedUnits[to] == null) {
      sendCmdReply(interaction, `Unknown unit: ${to}`, this.logger, LogLevel.DEBUG, { ephemeral: true });
      return;
    }

    let convertedAmount: string;
    if (this.supportedUnits[from] == 'currency') {
      // Use CurrencyConversion to do the conversion
      convertedAmount = CurrencyConversion.convert(amount, from, to).toFixed(2);
    } else {
      // Use convert-units to do the conversion
      convertedAmount = convert(amount).from(<convert.Unit> from).to(<convert.Unit> to).toPrecision(3);
    }

    replyWithEmbed(interaction, [
      { name: "Conversion", value: `${amount} ${from} = ${convertedAmount} ${to}` }
    ], this.logger, `Converted from ${from} to ${to}`, LogLevel.TRACE);
  }

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedOption = interaction.options.getFocused();
    // Get top 5 unit suggestions
    let suggestions = this.unitSearch.search(focusedOption, { limit: 5 }).map(res => res.item);

    this.logger.trace(`Generated suggestions: partial=${suggestions}`);
    // Return the suggestions
    interaction.respond(suggestions.map(s => ({
      name: s,
      value: s
    })));
  }

}