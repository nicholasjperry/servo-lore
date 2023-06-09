const { EmbedBuilder, Client, GatewayIntentBits} = require('discord.js');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();
const throng = require('throng');

var WORKERS = process.env.WEB_CONCURRENCY || 1;

async function start(){

    // Instantiating bot/intents
    const client = new Client({ 
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
    });

    let post = {
        body: '',
        header: '',
        footer: ''
    }

    const scrapeData = async () => {
        // Opening browser instance
        const browser = await puppeteer.launch({
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-zygote"],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        });
        
        // Navigating to URL
        const url = 'https://wh40k.lexicanum.com/wiki/Special:Random';
        const page = await browser.newPage();
        await page.goto(url, { timeout: 120000 });
        console.log(`Navigating to ${url}`);

        try {
            // Scraping data
            post.header = await page.evaluate(() => {
                return document.querySelector('h1#firstHeading')?.textContent;
            });

            post.body = await page.evaluate(() => {
                const body = document.querySelector('#bodyContent #mw-content-text .mw-parser-output p')?.textContent;
                if (body && body.length > 0) {
                    return document.querySelector('#bodyContent #mw-content-text .mw-parser-output p')?.textContent;
                }
            });

            post.footer = await page.evaluate(() => {
                return document.querySelector('#globalWrapper')?.baseURI;
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
        channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(post.header)
                .setDescription(post.body)
                .setColor('#000000')
                .addFields(
                    { name: `Find out more about ${post.header} here:`, value: `${post.footer}`}
                )
            ]
        });
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
        cron.schedule('0 * * * *', async () => {
            await deleteEmbedMessage();
            await sendEmbedMessage();
        }, {
            timezone: 'America/New_York'
        });
    });
}

throng({
    workers: WORKERS,
    lifetime: Infinity,
    start: start
});