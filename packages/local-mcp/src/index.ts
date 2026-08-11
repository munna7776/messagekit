import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { telegramMessageInputSchema, sendTelegramMessage } from "@messagekit/core";

const server = new McpServer({ name: "messagekit", version: "0.0.0" });

function getBotToken(): string {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set in the MCP environment variables.");
  }
  return botToken;
}

server.registerTool(
  "telegram",
  {
    title: "Telegram",
    description: "Send a Telegram message",
    inputSchema: telegramMessageInputSchema,
  },
  async (input) => {
    const result = await sendTelegramMessage({
      ...input,
      botToken: getBotToken(),
    });

    return {
      content: [
        {
          type: "text",
          text: `Sent Telegram message ${result.messageId} to chat id: ${result.chatId}`,
        },
      ],
      structuredContent: result,
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
