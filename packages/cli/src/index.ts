import { Command } from "commander";
import { z, ZodError } from "zod";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { sendTelegramMessage } from "@messagekit/core";

const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

const configPath = join(homedir(), ".config", "messagekit", "config.json");

function writeTelegramBotToken(telegramBotToken: string) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(
    configPath,
    `${JSON.stringify({ telegramBotToken }, null, 2)}\n`,
    {
      mode: 0o600,
    },
  );
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Run `messagekit init`");
  }

  const config = cliConfigSchema.parse(
    JSON.parse(readFileSync(configPath, "utf-8")),
  );

  const token = config.telegramBotToken;
  if (!token) {
    throw new Error("Telegram bot token is required. Run `messagekit init`");
  }

  return token;
}

const program = new Command();

program.name("messagekit").description("A CLI tool for MessageKit");

program
  .command("init")
  .requiredOption("--telegram-bot-token <botToken>", "Telegram Bot Token")
  .action((options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(`Save messagekit cli config to ${configPath}`);
  });

program
  .command("telegram")
  .description("Send a Telegram message")
  .argument("<chatId>", "The chat ID for the Telegram command")
  .argument("<message>", "The message to send")
  .action(async (chatId: string, message: string) => {
    const result = await sendTelegramMessage({
      botToken: getTelegramBotToken(),
      chatId,
      message,
    });

    console.log(JSON.stringify(result));
  });

await program.parseAsync(process.argv).catch((err) => {
  if (err instanceof ZodError) {
    err.issues.forEach((issue) => {
      console.log(`${issue.message}\n`);
    });
  } else {
    const message = err instanceof Error ? err.message : String(err);
    console.log(message);
  }
  process.exit(1);
});
