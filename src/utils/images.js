export async function extractSingleColorFromImage(sharpImage) {
  const stats = await sharpImage.stats();

  if (!stats.channels.every((channel) => channel.min === channel.max)) {
    return null;
  }

  const [r, g, b] = stats.channels.map((channel) => channel.min);
  return { r, g, b };
}
