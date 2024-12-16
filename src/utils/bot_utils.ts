import { Logger, LogLevel } from "bot-framework";
import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { FUMI_EMBED_COLOUR } from "fumi/constants.js";

/**
 * Reply to an interaction with an embed with given fields.
 * 
 * This sets out a uniform embed style, and logs the interaction if a log message is provided.
 * 
 * Default log level is INFO.
 * @param interaction Discord chat interaction
 * @param fields Embed fields
 * @param logger Command logger
 * @param logMessage Log message to print
 * @param logLevel Log level to print at
 */
export async function replyWithEmbed(interaction: ChatInputCommandInteraction, 
    fields: APIEmbedField[], logger: Logger, logMessage?: string, logLevel = LogLevel.INFO): Promise<void> {
  // Build embed with given fields
  const reply = new EmbedBuilder()
    .setColor(FUMI_EMBED_COLOUR)
    .addFields(fields).toJSON();
  // Send the reply
  await interaction.reply({
    embeds: [ reply ],
    allowedMentions: { parse: [] }
  });
  // Log the interaction if there is a log message
  if (logMessage) {
    logger.log(`${interaction.user.username} - ${interaction.guild.name} - ${logMessage}`, logLevel);
  }
}