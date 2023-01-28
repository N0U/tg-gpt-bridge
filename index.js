require('dotenv').config();

const { Telegraf, Telegram } = require('telegraf');
const { Configuration, OpenAIApi } = require('openai');

const config = new Configuration({
    apiKey: process.env.OAI_API_KEY,
});
const openAi = new OpenAIApi(config);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));

function isWhitelisted(id) {
  return [309719712, 103109725].includes(id);
}

bot.on('message', async (ctx) => {
  const { from } = ctx;
  const { message } = ctx;
  const { text } = message;
  const { chat } = message;
  const { id } = chat;

  if(!isWhitelisted(from.id)) {
    ctx.reply('Не для вас бот мой писался');
    return;
  }
  ctx.sendChatAction('typing');

  const response = await openAi.createCompletion({
      prompt: text,
      model: 'text-davinci-003',
      max_tokens: 512,
      temperature: 1,
      top_p: 1,
  });

  const { choices, usage } = response.data;
  const { text: answer } = choices[0];

  await ctx.reply(answer);
  ctx.reply(`Tokens: ${usage.total_tokens}`);
});

bot.launch();
