import { Logger } from "bot-framework";

import { Fumi } from "fumi/modules/fumi.js";

// Setup global logger
const logger = new Logger("Server");
logger.registerAsGlobal();

// Setup bot services
const discordToken: string = process.env.DISCORD_TOKEN;
Fumi.init(discordToken);

logger.info("Server started");