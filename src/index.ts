import "dotenv/config";
import express, { Request, Response } from "express";
import { Telegraf, Markup, Context } from "telegraf";

const app = express();
const { BOT_TOKEN, HOSTNAME, PORT } = process.env;

const bot = new Telegraf(BOT_TOKEN ?? "");

bot.start((ctx) =>
  ctx.reply(
    "Menu:",
    Markup.inlineKeyboard([
      [Markup.button.callback("Set Webhook", "setwebhook")],
      [Markup.button.callback("About", "about")],
    ])
  )
);

bot.command("menu", (ctx: Context): void => {
  ctx.reply(
    "Menu:",
    Markup.inlineKeyboard([
      [Markup.button.callback("Set Webhook", "etwebhook")],
      [Markup.button.callback("Set Group Webhook", "etgroupwebhook")],
      [Markup.button.callback("About", "about")],
    ])
  );
});

bot.action("setwebhook", (ctx: Context): void => {
  const chatId = String(ctx.chat?.id);
  ctx.reply(`Webhook settings set up successfully! To receive notifications, please follow these steps:

1. Go to your GitHub repository settings.
2. Click on "Webhooks" in the left-hand menu.
3. Click on "Add webhook".
4. Enter the following URL: \`${HOSTNAME}/github-webhook?t=${chatId}\`
5. Select "application/json" as the content type.
6. Select "Send me everything" as the event type.
7. Click "Add webhook" to save the changes.

You will now receive notifications for this repository.`);
});

bot.action("about", (ctx: Context): void => {
  ctx.reply(
    "This bot is designed to receive GitHub notifications and send them to you via Telegram. It was created by [Your Name]."
  );
});

app.use(express.json());

app.post("/telegraf-webhook", (req: Request, res: Response): void => {
  bot.handleUpdate(req.body);
  res.status(200).send("");
});

app.post("/github-webhook", async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;
  const chatId = String(req.query?.t ?? "");
  if (event === "push") {
    const repoName = payload.repository.name;
    const commitMessage = payload.commits[0].message;
    const branchName = payload.ref.replace("refs/heads/", "");

    if (chatId) {
      // Send a notification to the user or group
      await bot.telegram.sendMessage(
        chatId,
        `Perubahan pada repository ${repoName}:\n\nPesan: ${commitMessage}\nCabang: ${branchName}`
      );
    }
  }

  res.status(200).send("OK!");
});

bot.launch();

app.listen(PORT || 3000, (): void => {
  console.log("Server listening on port 3000");
});
