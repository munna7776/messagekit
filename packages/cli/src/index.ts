import { Command } from "commander";

type TelegramResponse = {
  ok: boolean;
  result?: {
    message_id?: number;
  };
  description?: string;
};

const program = new Command();

program
  .name("messagekit")
  .description("A CLI tool for MessageKit")
  .command("telegram")
  .description("Send a Telegram message")
  .argument("<chatId>", "The chat ID for the Telegram command")
  .argument("<message>", "The message to send")
  .action(async (chatId: string, message: string) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error(
        "TELEGRAM_BOT_TOKEN is not set in the environment variables.",
      );
      process.exit(1);
    }

    if (!chatId) {
      console.error("Chat ID is required.");
      process.exit(1);
    }

    if (!message) {
      console.error("Message is required.");
      process.exit(1);
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );
    const data = (await response.json()) as TelegramResponse;
    if (!response.ok || !data.ok) {
      const errorMessage = data.description || response.statusText;
      console.error("Telegram API request failed: ", errorMessage);
      process.exit(1);
    }

    const messageId = data.result?.message_id;
    console.log("Send message successfully. Chat ID:", chatId);

    if (messageId !== undefined) {
      console.log("Telegram Message ID:", messageId);
    }
  });

await program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
