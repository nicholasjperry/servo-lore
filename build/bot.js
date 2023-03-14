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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = __importDefault(require("puppeteer"));
dotenv_1.default.config();
// Instantiating bot/intents
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent, discord_js_1.GatewayIntentBits.GuildMembers]
});
const scrapeData = () => __awaiter(void 0, void 0, void 0, function* () {
    // Open browser instance
    const browser = yield puppeteer_1.default.launch({
        headless: false,
        defaultViewport: null,
    });
    const url = 'https://wh40k.lexicanum.com/wiki/Special:Random';
    // Navigate to URL
    const page = yield browser.newPage();
    yield page.goto(url);
    console.log(`Navigating to ${url}`);
    // await page.waitForSelector('#n-randompage a[href="/wiki/Special:Random"]');
    // await page.click('#n-randompage a[href="/wiki/Special:Random"]');
    // await page.waitForNavigation();
    try {
        // Scraping data
        const body = yield page.evaluate(() => {
            var _a;
            return (_a = document.querySelector('#bodyContent #mw-content-text p')) === null || _a === void 0 ? void 0 : _a.textContent;
        });
        // const header = await page.evaluate(() => {
        //     return document.querySelector('h1[class="firstHeading"]')?.textContent;
        // });
        return body;
    }
    catch (err) {
        console.log(err);
    }
    finally {
        yield page.setCacheEnabled(false);
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
            new discord_js_1.EmbedBuilder()
                .setDescription(data)
                .setColor('Aqua')
        ]
    });
});
const deleteEmbedMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const channel = client.channels.cache.get('1084926092600688740');
    const messages = yield channel.messages.fetch();
    const botMessage = messages.find((m) => { var _a; return m.author.id === ((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id); });
    if (botMessage) {
        yield botMessage.delete();
    }
    else {
        return;
    }
});
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteEmbedMessage();
        yield sendEmbedMessage();
    }), 60000 * 6);
}));
// Logging the bot in to the server with token
client.login(process.env.BOT_TOKEN);
