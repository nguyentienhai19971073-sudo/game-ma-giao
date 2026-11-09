/** TikTok LIVE's nickname is the public display name, unlike displayId or numeric User.id. */
export function getTikTokDisplayName(user: {
  nickname?: string;
  username?: string;
  userId?: string;
}): string {
  // Keep userId internal: never show a long numeric ID as someone's name.
  for (const value of [user.nickname, user.username]) {
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name || name === user.userId || /^\d{10,}$/.test(name)) continue;
    return name;
  }
  return 'Phật tử';
}
