// src/index.ts
import { getInput, setFailed } from '@actions/core';
import { resolve } from 'path';
import { exec } from '@actions/exec';

const resolvePath = (relativePath: string): string =>
  resolve(`${process.env.GITHUB_WORKSPACE}/${relativePath}`);

const scriptName = getInput('scriptName', { required: true });
const scriptPathInput = getInput('scriptPath', { required: true });

const scriptPath = resolvePath(scriptPathInput);

async function failScript(result: string): Promise<void> {
  const message = `\`npm run ${scriptName}\` has failed\n\`\`\`${result}\`\`\``;
  return setFailed(message);
}

let myOutput = '';

async function runScript(): Promise<void> {
  await exec('npm', ['ci'], { cwd: scriptPath, silent: true });

  exec('npm', ['run', scriptName], {
    cwd: scriptPath,
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString();
      },
      stderr: (data: Buffer) => {
        myOutput += data.toString();
      },
    },
  }).catch((e) => failScript(myOutput));
}

runScript().catch((error) => setFailed(error.message));
