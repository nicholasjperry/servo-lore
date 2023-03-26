const { EmbedBuilder, Client, GatewayIntentBits} = require('discord.js');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();

// Instantiating bot/intents
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

let post = {
    body: '',
    header: ''
}

const scrapeData = async () => {
    // Opening browser instance
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-zygote"],
        // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    
    // Navigating to URL
    const url = 'https://wh40k.lexicanum.com/wiki/Special:Random';
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`Navigating to ${url}`);

    try {
        // Scraping data
        post.header = await page.evaluate(() => {
            return document.querySelector('h1#firstHeading')?.textContent;
        });

        post.body = await page.evaluate(() => {
            return document.querySelector('#bodyContent #mw-content-text .mw-parser-output p')?.textContent;
        });

        await browser.close();
        return post;
    } catch(err) {
        console.log(err); 
    }
}

// Sending embed message
const sendEmbedMessage = async () => {
    await scrapeData();
    const channel = client.channels.cache.get('1084926092600688740');

    if(post.body !== undefined || post.body !== null) {
        channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(post.header)
                .setDescription(post.body)
                .setColor('#000000')
            ]
        });
    } else {
        await sendEmbedMessage();
    }
}

// Delete embed message
const deleteEmbedMessage = async () => {
    const channel = client.channels.cache.get('1084926092600688740');
    const messages = await (channel).messages.fetch();
    const botMessage = messages?.find((message: any) => message.author.id === client?.user?.id);

    if (botMessage) {
        await botMessage.delete();
    } else {
        return;
    }
}

// Logging the bot in to the server with token
client.login(process.env.BOT_TOKEN);


// Ready event triggered
client.on('ready', async () => {
    await deleteEmbedMessage();
    await sendEmbedMessage();
});
// client.on('ready', async () => {
//     cron.schedule('0 * * * *', async () => {
//         await deleteEmbedMessage();
//         await sendEmbedMessage();
//     }, {
//         timezone: 'America/New_York'
//     });
// });
