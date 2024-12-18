import { Logger, LogLevel } from "bot-framework";
import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder, EmbedField } from "discord.js";

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
    .addFields(fields.map(trimFieldPropertiesLength)).toJSON();

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

/**
 * Trim EmbedField values to meet the requirements
 * @param field EmbedField
 * @returns Same field
 */
function trimFieldPropertiesLength(field: EmbedField): EmbedField {
  // Sanitise field.name
  if (field.name.length == 0) {
    // Handle 0 length
    field.name = '" "';
  } else if (field.name.length > 1024) {
    // Handle above 1024 long
    field.name = field.name.substring(0, 1021) + '...';
  }

  // Sanitise field.value
  if (field.value.length == 0) {
    // Handle 0 length
    field.value = '" "';
  } else if (field.value.length > 1024) {
    // Handle above 1024 long
    field.value = field.value.substring(0, 1021) + '...';
  }

  return field;
}