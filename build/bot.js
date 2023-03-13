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
require('dotenv').config();
// import { scrape } from './scrape';
const { EmbedBuilder } = require('discord.js');
const { Client } = require('discord.js');
const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"]
});
// const prefix = '/';
client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.author.client)
        return;
    message.channel.send({
        embeds: [new EmbedBuilder()
                .setDescription(`A look at this week's Deep Dive`)
                .setTitle(`Deep Dive`)
                .setAuthor({
                name: client.user.tag,
                iconURL: client.user.defaultAvatarURL,
            })
                .setColor('Aqua')
        ]
    });
}));
client.login(process.env.BOT_TOKEN);
// scrape();
