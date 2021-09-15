#!/usr/bin/env node
'use strict';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';

import {
  imageFormat,
  materialOnly,
  replaceSingleColorTexture,
} from '../src/transforms/index.js';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: node $0 -i inputPath -o outputPath')
  .help('h')
  .alias('h', 'help')
  .options({
    input: {
      alias: 'i',
      describe: 'Path to the glTF or glb file.',
      type: 'string',
      normalize: true,
      demandOption: true,
    },
    output: {
      alias: 'o',
      describe: 'Output path of the glTF or glb file.',
      type: 'string',
      normalize: true,
    },
    binary: {
      alias: 'b',
      describe: 'Save output as binary glb.',
      type: 'boolean',
      default: false,
    },
    materialOnly: {
      alias: 'mo',
      describe: 'Remove all elements except for materials.',
      type: 'boolean',
      default: false,
    },
    imageFormat: {
      alias: 'if',
      describe: 'Convert textures to different image format.',
      type: 'string',
    },
    quality: {
      alias: 'q',
      describe: 'Quality setting (0 - 100) when using the imageFormat option.',
      type: 'number',
    },
    replaceSingleColorTextures: {
      alias: 'rsct',
      describe:
        'Replace all textures that have only a single color with a simple value.',
      type: 'boolean',
      default: false,
    },
  })
  .check((argv) => {
    if (!fs.existsSync(argv.input)) {
      throw new Error(`File not found: ${argv.input}`);
    }

    const inputExtension = path.extname(argv.input).toLowerCase();
    if (!['.gltf', '.glb'].includes(inputExtension)) {
      throw new Error(`Unknown file extension for input: ${inputExtension}`);
    }

    if (argv.imageFormat && !['webp'].includes(argv.imageFormat)) {
      throw new Error(`Unsupported image format: ${argv.imageFormat}`);
    }

    return true;
  })
  .parse(process.argv);

const inputPath = argv.input;
let outputPath = argv.output;

const inputDirectory = path.dirname(inputPath);
const inputName = path.basename(inputPath, path.extname(inputPath));

let outputExtension;
if (!outputPath) {
  if (argv.binary) {
    outputExtension = '.glb';
  } else {
    outputExtension = '.gltf';
  }
  outputPath = path.join(
    inputDirectory,
    inputName + '-processed' + outputExtension
  );
}

const transforms = [
  argv.materialOnly ? materialOnly() : null,
  argv.replaceSingleColorTextures ? replaceSingleColorTexture() : null,
  argv.imageFormat
    ? imageFormat({ format: argv.imageFormat, quality: argv.quality })
    : null,
].filter(Boolean);

const io = new NodeIO();
const document = io.read(inputPath);

await document.transform(...transforms);

io.write(outputPath, document);
