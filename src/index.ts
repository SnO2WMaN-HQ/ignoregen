#!/usr/bin/env node
import {Option, parse} from '@ignoregen/core';
import {cac} from 'cac';
import {readFile, writeFile} from 'fs';
import glob from 'glob';
import {PromiseValue} from 'type-fest';
import {promisify} from 'util';
import {getConfig} from './option';

export async function parseFile(path: string, rcOption: Partial<Option>) {
  const input = await promisify(readFile)(path, {
    encoding: 'utf-8',
  }).then((value) => value.split('\n'));
  const output = await parse(input, rcOption);
  return {path, input, output};
}

export async function overwrite({
  path,
  output,
}: PromiseValue<ReturnType<typeof parseFile>>) {
  return promisify(writeFile)(path, output.join('\n'));
}

export async function gl(pattern: string, rcOption: Partial<Option>) {
  const paths = await promisify(glob)(pattern, {absolute: true});
  return Promise.all(paths.map((path) => parseFile(path, rcOption)));
}

(async () => {
  const rcOption = await getConfig(process.cwd());

  const cli = cac();

  cli.command('[...files]').action(async (patterns: string[], options) => {
    const parsed = (
      await Promise.all(patterns.map((file) => gl(file, rcOption)))
    ).flat();
    await Promise.all(parsed.map((value) => overwrite(value)));
  });

  cli.help();
  cli.parse();
})();
