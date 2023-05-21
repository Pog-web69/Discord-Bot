import path from "node:path";
import { SlashCommandBuilder } from "discord.js";
import { QuickDB } from "quick.db";
import __ from "../../service/i18n.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const db = new QuickDB({
    filePath: path.resolve("./data/user_data.sqlite"),
});

export default {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Shows your or another users stats.")
        .setDMPermission(false)
        .addUserOption((option) =>
            option.setName("user")
                .setDescription("The user to show stats for")
                .setRequired(false)),
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction){
        const user = interaction.options.get("user");
        if (user?.user?.bot){
            return await interaction.reply({
                content: await __("errors.stats_on_bot")(interaction.guildId),
                ephemeral: true,
            });
        }

        const userid = user?.user?.id || interaction.user.id;
        const wins = (await db.get(`guild-${interaction.guildId}.user-${userid}.counting-wins`)) || 0;
        const fails = (await db.get(`guild-${interaction.guildId}.user-${userid}.counting-fails`)) || 0;

        const stats = `:\n\n✅ ${
            await __("replies.stats.wins")(interaction.guildId)
        }: \`${wins}\`\n❌ ${
            await __("replies.stats.fails")(interaction.guildId)
        }: \`${fails}\``;

        if (!user?.user?.id){
            return await interaction.reply(
                await __("replies.stats.your_stats")(interaction.guildId) + stats,
            );
        }
        return await interaction.reply(
            await __("replies.stats.stats_for", user.user.username)(interaction.guildId) + stats,
        );
    },
};
