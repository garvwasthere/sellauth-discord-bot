import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coupon-read')
    .setDescription('List all coupons.')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The coupon code to search for')
        .setRequired(false)
    ),

  async execute(interaction, api) {
    const shopId = api.shopId;
    const code = interaction.options.getString('code');
    const pageSize = 10; // Number of coupons per page
    let page = 1; // Current page

    try {
      let coupons = await api.get(`shops/${shopId}/coupons`) || [];

      if (code) {
        // If a code is provided, filter the coupons to find the one with the matching code
        const coupon = coupons.find(coupon => coupon.code === code);
        if (!coupon) {
          await interaction.reply({ content: `No coupon found with the code: ${code}`, ephemeral: true });
          return;
        }

        // Create an embed for the single coupon
        const embed = new EmbedBuilder()
          .setTitle('Coupon Details')
          .setColor('#0099ff')
          .setTimestamp()
          .setDescription(`\`Code:\` ${coupon.code}, \`ID:\` ${coupon.id}`);

        await interaction.reply({ embeds: [embed] });
        return;
      }

      const totalPages = Math.ceil(coupons.length / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, coupons.length);
      const currentCoupons = coupons.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setTitle('Coupon List')
        .setColor('#0099ff')
        .setTimestamp();

      if (currentCoupons.length === 0) {
        embed.setDescription('No coupons found.');
      } else {
        embed.setDescription(currentCoupons.map(coupon => `\`Code:\` ${coupon.code}, \`ID:\` ${coupon.id}`).join('\n'));
        embed.setFooter({ text: `Page ${page} of ${totalPages}` });
      }

      const components = [];
      if (totalPages > 1) {
        const row = new ActionRowBuilder();
        if (page > 1) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId('coupon-list-prev')
              .setLabel('Previous')
              .setStyle(ButtonStyle.Primary)
          );
        }
        if (page < totalPages) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId('coupon-list-next')
              .setLabel('Next')
              .setStyle(ButtonStyle.Primary)
          );
        }
        components.push(row);
      }

      const initialResponse = await interaction.reply({ embeds: [embed], components: components, fetchReply: true });

      if (totalPages > 1) {
        const collector = interaction.channel.createMessageComponentCollector({
          filter: i => i.user.id === interaction.user.id && i.message.id === initialResponse.id,
          time: 15000 // 15 seconds to interact
        });

        collector.on('collect', async i => {
          if (i.customId === 'coupon-list-prev') page--;
          else if (i.customId === 'coupon-list-next') page++;

          const startIndex = (page - 1) * pageSize;
          const endIndex = Math.min(startIndex + pageSize, coupons.length);
          const currentCoupons = coupons.slice(startIndex, endIndex);

          embed.setDescription(currentCoupons.length === 0 ? 'No coupons found.' : currentCoupons.map(coupon => `\`Code:\` ${coupon.code}, \`ID:\` ${coupon.id}`).join('\n'));
          embed.setFooter({ text: `Page ${page} of ${totalPages}` });

          const newComponents = [];
          const row = new ActionRowBuilder();
          if (page > 1) row.addComponents(new ButtonBuilder().setCustomId('coupon-list-prev').setLabel('Previous').setStyle(ButtonStyle.Primary));
          if (page < totalPages) row.addComponents(new ButtonBuilder().setCustomId('coupon-list-next').setLabel('Next').setStyle(ButtonStyle.Primary));
          if (row.components.length > 0) newComponents.push(row);

          await i.update({ embeds: [embed], components: newComponents });
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            interaction.editReply({ components: [] }); // Remove buttons after timeout
          }
        });
      }
    } catch (error) {
      console.error('Error listing coupons:', error);
      await interaction.reply({ content: 'Failed to list coupons.', ephemeral: true });
    }
  },
};
