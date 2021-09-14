#!/usr/bin/env node
'use strict';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';

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
  })
  .check((argv) => {
    if (!fs.existsSync(argv.input)) {
      throw new Error(`File not found: ${argv.input}`);
    }

    const inputExtension = path.extname(argv.input).toLowerCase();
    if (!['.gltf', '.glb'].includes(inputExtension)) {
      throw new Error(`Unknown file extension for input: ${inputExtension}`);
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

// const outputDirectory = path.dirname(outputPath);
// const outputName = path.basename(outputPath, path.extname(outputPath));
// outputExtension = path.extname(outputPath).toLowerCase();
// if (outputExtension !== '.gltf' && outputExtension !== '.glb') {
//   console.log('Error: unrecognized file extension "' + outputExtension + '".');
// }
