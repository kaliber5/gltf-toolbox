import sharp from 'sharp';
import { extractSingleColorFromImage } from '../utils/images.js';
import { getTextureSlots } from '../utils/gltf.js';
import { ColorUtils, Material } from '@gltf-transform/core';

function isDefaultNormal({ r, g, b }) {
  return r === 128 && g === 128 && b === 255;
}

export function replaceSingleColorTexture() {
  return async (doc) => {
    const textures = doc.getRoot().listTextures();

    for (const texture of textures) {
      const imageData = texture.getImage();
      if (!imageData) {
        continue;
      }
      const sharpImage = new sharp(Buffer.from(imageData));
      const singleColor = await extractSingleColorFromImage(sharpImage);
      if (singleColor === null) {
        // not a single color image
        continue;
      }

      const slots = new Set(getTextureSlots(doc, texture));
      const materials = texture
        .listParents()
        .filter((parent) => parent instanceof Material);

      for (const material of materials) {
        if (material.getBaseColorTexture() === texture) {
          // @todo handle alpha?
          material
            .setBaseColorFactor(
              ColorUtils.convertSRGBToLinear(
                [
                  singleColor.r / 255,
                  singleColor.g / 255,
                  singleColor.b / 255,
                  1,
                ],
                [1, 1, 1, 1]
              )
            )
            .setBaseColorTexture(null);

          slots.delete('baseColorTexture');
        }

        if (
          material.getNormalTexture() === texture &&
          isDefaultNormal(singleColor)
        ) {
          material.setNormalTexture(null);
          slots.delete('normalTexture');
        }

        // Remove occlusion texture only if all occlusion values (.r) are 255
        if (
          material.getOcclusionTexture() === texture &&
          singleColor.r === 255
        ) {
          material.setOcclusionTexture(null);
          slots.delete('occlusionTexture');
        }

        if (material.getMetallicRoughnessTexture() === texture) {
          material
            .setMetallicFactor(singleColor.b / 255)
            .setRoughnessFactor(singleColor.g / 255)
            .setMetallicRoughnessTexture(null);
          slots.delete('metallicRoughnessTexture');
        }

        if (material.getEmissiveTexture() === texture) {
          material
            .setEmissiveFactor([
              singleColor.r / 255,
              singleColor.g / 255,
              singleColor.b / 255,
            ])
            .setEmissiveTexture(null);
          slots.delete('emissiveTexture');
        }
      }

      if (slots.size === 0) {
        texture.dispose();
      }
    }
  };
}
