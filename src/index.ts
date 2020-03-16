// src/index.ts
import { getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { resolve } from 'path';

function resolvePath(relativePath: string): string {
  return resolve(`${process.env.GITHUB_WORKSPACE}/${relativePath}`);
}

const scriptName = getInput('scriptName', { required: true });
const scriptPathInput = getInput('scriptPath', { required: true });

const scriptPath = resolvePath(scriptPathInput);

async function failScript(result: string): Promise<void> {
  const message = `\`npm run ${scriptName}\` has failed\n\`\`\`${result}\`\`\``;
  return setFailed(message);
}

let myOutput = '';

async function runScript(): Promise<void> {
  console.log('About to install deps!');

  await exec('npm', ['ci'], { cwd: scriptPath, silent: false });

  console.log('Running script');
  exec('npm', ['run', scriptName], {
    cwd: scriptPath,
    silent: false,
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
