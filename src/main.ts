import { Logger } from "bot-framework";

import { Fumi } from "fumi/modules/fumi.js";

const logger = new Logger("Server");

// Setup bot services
const discordToken: string = process.env.DISCORD_TOKEN;
Fumi.init(discordToken);

logger.registerAsGlobal();
logger.info("Server started");