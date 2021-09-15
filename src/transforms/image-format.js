import sharp from 'sharp';
import path from 'path';
import { TextureWebP } from '@gltf-transform/extensions';

// using lossy compression on potentially high frequency textures like normal maps yielded poor results (e.g. the color
// for a perpendicular normal was not exactly 127/127/255 anymore). Using nearLossless mode seems to work better for these kind
// of textures. Unfortunately the settings are poorly documented in https://sharp.pixelplumbing.com/api-output#parameters-7.
// See also https://groups.google.com/a/webmproject.org/g/webp-discuss/c/0GmxDmlexek
const slotsRequiringNearLossless = [
  'metallicRoughnessTexture',
  'normalTexture',
];

// Shamelessly stolen from https://github.com/donmccurdy/glTF-Transform/pull/148/files#diff-7d271f1ad53a2956266ef34de63601f1ea5205eab905c549ac8c66c4a17076f0
export function getTextureSlots(doc, texture) {
  return doc
    .getGraph()
    .getLinks()
    .filter((link) => link.getChild() === texture)
    .map((link) => link.getName())
    .filter((slot) => slot !== 'texture');
}

export function imageFormat({ format, quality }) {
  return async (doc) => {
    doc.createExtension(TextureWebP).setRequired(true);
    const textures = doc.getRoot().listTextures();

    for (const texture of textures) {
      const imageData = texture.getImage();
      if (!imageData) {
        return;
      }

      const slots = getTextureSlots(doc, texture);
      const nearLossless = slots.some((slot) =>
        slotsRequiringNearLossless.includes(slot)
      );

      const sharpImage = new sharp(Buffer.from(imageData));
      switch (format) {
        case 'webp':
          sharpImage.webp({
            nearLossless,
            quality: nearLossless ? 50 : quality,
            reductionEffort: 6,
          });
          break;
        default:
          throw new Error(`unsupported image format: ${format}`);
      }

      texture
        .setImage((await sharpImage.toBuffer()).buffer)
        .setMimeType(`image/${format}`);

      if (texture.getURI()) {
        texture.setURI(`${path.basename(texture.getURI())}.${format}`);
      }
    }
  };
}
