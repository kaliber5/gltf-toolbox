import sharp from 'sharp';
import path from 'path';
import { TextureWebP } from '@gltf-transform/extensions';

export function imageFormat({ format, quality }) {
  return async (doc) => {
    doc.createExtension(TextureWebP).setRequired(true);
    const textures = doc.getRoot().listTextures();

    for (const texture of textures) {
      const imageData = texture.getImage();
      if (!imageData) {
        return;
      }

      const sharpImage = new sharp(Buffer.from(imageData));
      switch (format) {
        case 'webp':
          sharpImage.webp({ quality });
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
