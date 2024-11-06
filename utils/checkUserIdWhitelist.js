export async function checkUserIdWhitelist(command, interaction, config) {
  const userId = interaction.user.id;

  if (command.onlyWhitelisted) {
    return config.BOT_USER_ID_WHITELIST.includes(userId);
  }

  return true;
}
