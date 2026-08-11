import {
  type TelegramMessageOptions,
  telegramMessageOptionsSchema,
  telegramSendMessageRequestSchema,
  telegramSendMessageResponseSchema,
  telegramMessageOutputSchema,
} from "./schema";

export async function sendTelegramMessage(input: TelegramMessageOptions) {
  const parsedInput = telegramMessageOptionsSchema.parse(input);

  const requestBody = telegramSendMessageRequestSchema.parse({
    chat_id: parsedInput.chatId,
    text: parsedInput.message,
  });

  const response = await fetch(`https://api.telegram.org/bot${parsedInput.botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: await Response.json(requestBody).text(),
  });

  const data = telegramSendMessageResponseSchema.parse(await response.json());
  if (!response.ok || !data.ok || !data.result) {
    throw new Error(data.description || response.statusText);
  }

  return telegramMessageOutputSchema.parse({
    ok: true,
    messageId: data.result.message_id,
    chatId: parsedInput.chatId,
  });
}
