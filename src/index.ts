import { EmbedBuilder, Client, GatewayIntentBits} from 'discord.js';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
dotenv.config();

// Instantiating bot/intents
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const scrapeData = async () => {
    // Open browser instance
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    const url = 'https://wh40k.lexicanum.com/wiki/Special:Random';
    
    // Navigate to URL
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`Navigating to ${url}`);
    try {
        
        // Scraping data
        const body = await page.evaluate(() => {
            return document.querySelector('#bodyContent #mw-content-text p')?.textContent;
        });

        return body;
    } catch(err) {
        console.log(err); 
    } finally {
        await page.close();
        await browser.close();
    }
}

// Sending embed message
const sendEmbedMessage = async () => {
    const data = await scrapeData();
    const channel = client.channels.cache.get('1084926092600688740');
    (channel as any).send({
        embeds: [
            new EmbedBuilder()
            .setDescription(data as any)
            .setColor('Aqua')
        ]
    });
}

const deleteEmbedMessage = async () => {
    const channel = client.channels.cache.get('1084926092600688740');
    const messages = await (channel as any).messages.fetch()
    const botMessage = messages.find((m: { author: { id: string | undefined; }; }) => m.author.id === client?.user?.id)

    if (botMessage) {
        await botMessage.delete();
    } else {
        return;
    }
}

client.on('ready', async () => {
    setInterval(async () => {
        await deleteEmbedMessage();
        await sendEmbedMessage();
    }, 10000)
});

// Logging the bot in to the server with token
client.login(process.env.BOT_TOKEN);