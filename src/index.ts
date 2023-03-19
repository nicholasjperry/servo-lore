const { EmbedBuilder, Client, GatewayIntentBits} = require('discord.js');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();

// Instantiating bot/intents
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const scrapeData = async () => {
    // Open browser instance
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-zygote"],
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
    channel.send({
        embeds: [
            new EmbedBuilder()
            .setDescription(data)
            .setColor('Aqua')
        ]
    });
}

const deleteEmbedMessage = async () => {
    const channel = client.channels.cache.get('1084926092600688740');
    const messages = await (channel).messages.fetch();
    const botMessage = messages?.find((message: Record<string, any>) => message.author.id === client?.user?.id);

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
