import { Logger, LogLevel } from "bot-framework";
import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { FUMI_EMBED_COLOUR } from "fumi/constants.js";

/**
 * Reply to an interaction with an embed with given fields.
 * 
 * This sets out a uniform embed style, and logs the interaction.
 * 
 * Default
 * @param interaction 
 * @param fields 
 * @param logger 
 * @param logMessage 
 * @param logLevel 
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
  // Log the interaction
  let composedLogMessage = `${interaction.user.username} - ${interaction.guild.name}`;
  if (logMessage) {
    composedLogMessage += ` - ${logMessage}`;
  } else {
    composedLogMessage += ` - called ${logger.name}`;
  }
  logger.log(composedLogMessage, logLevel);
}