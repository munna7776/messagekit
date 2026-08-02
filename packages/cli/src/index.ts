import { Command } from "commander";
import { sendTelegramMessage } from "@messagekit/core";

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

    try {
      const result = await sendTelegramMessage({
        botToken,
        chatId,
        message,
      });

      console.log("Sent Telegram message to chat id: ", result.chatId);
      console.log("Telegram message id: ", result.messageId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to send Telegram message:", message);
      process.exit(1);
    }
  });

await program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
