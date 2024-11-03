export async function checkPermissions(command, interaction) {
  const member = await interaction.guild.members.fetch({ user: interaction.client.user.id });
  const requiredPermissions = command.permissions;

  if (!command.permissions) return { result: true, missing: [] };

  const missing = member.permissions.missing(requiredPermissions);

  return { result: !Boolean(missing.length), missing };
}
