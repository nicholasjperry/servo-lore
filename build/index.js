"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { EmbedBuilder, Client, GatewayIntentBits } = require('discord.js');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();
// Instantiating bot/intents
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});
const scrapeData = () => __awaiter(void 0, void 0, void 0, function* () {
    // Open browser instance
    const browser = yield puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-zygote"],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    const url = 'https://wh40k.lexicanum.com/wiki/Special:Random';
    // Navigate to URL
    const page = yield browser.newPage();
    yield page.goto(url);
    console.log(`Navigating to ${url}`);
    try {
        // Scraping data
        const body = yield page.evaluate(() => {
            var _a;
            return (_a = document.querySelector('#bodyContent #mw-content-text p')) === null || _a === void 0 ? void 0 : _a.textContent;
        });
        return body;
    }
    catch (err) {
        console.log(err);
    }
    finally {
        yield page.close();
        yield browser.close();
    }
});
// Sending embed message
const sendEmbedMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield scrapeData();
    const channel = client.channels.cache.get('1084926092600688740');
    channel.send({
        embeds: [
            new EmbedBuilder()
                .setDescription(data)
                .setColor('Aqua')
        ]
    });
});
const deleteEmbedMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const channel = client.channels.cache.get('1084926092600688740');
    const messages = yield (channel).messages.fetch();
    const botMessage = messages === null || messages === void 0 ? void 0 : messages.find((message) => { var _a; return message.author.id === ((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id); });
    if (botMessage) {
        yield botMessage.delete();
    }
    else {
        return;
    }
});
// Logging the bot in to the server with token
client.login(process.env.BOT_TOKEN);
// Ready event triggered
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    cron.schedule('*/1 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteEmbedMessage();
        yield sendEmbedMessage();
    }), {
        timezone: 'America/New_York'
    });
}));
