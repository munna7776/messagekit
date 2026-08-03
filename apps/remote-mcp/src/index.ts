import {
  McpServer,
  WebStandardStreamableHTTPServerTransport,
} from "@modelcontextprotocol/server";
import { Hono } from "hono";
import {
  telegramMessageInputSchema,
  sendTelegramMessage,
} from "@messagekit/core";

function createMCPServer(botToken: string) {
  const server = new McpServer({ name: "messagekit", version: "0.0.0" });

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
        botToken: botToken,
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

  return server;
}

const app = new Hono();

app.notFound((c) => c.json({ message: "Not Found" }, 404));

app.post("/:botToken/mcp", async (c) => {
  const botToken = c.req.param("botToken");
  const server = createMCPServer(botToken);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(c.req.raw);
  } finally {
    await server.close();
  }
});

const portNumber = Number(process.env.PORT ?? 3000);

export default {
  port: portNumber,
  fetch: app.fetch,
};
