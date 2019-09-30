// src/index.ts
import { getInput, setFailed } from '@actions/core';
import spawn from 'advanced-spawn-async';
import { resolve } from 'path';
import run from './run';

const resolvePath = (relativePath: string): string =>
  resolve(`${process.env.GITHUB_WORKSPACE}/${relativePath}`);

const scriptName = getInput('scriptName', { required: true });
const scriptPathInput = getInput('scriptPath', { required: true });

const scriptPath = resolvePath(scriptPathInput);

async function failScript(result: string): Promise<void> {
  const message = `\`npm run ${scriptName}\` has failed\n\`\`\`${result}\`\`\``;
  setFailed(message);
}

async function runScript(): Promise<void> {
  await run(`npm ci`, { cwd: resolvePath(scriptPath) });

  const { onclose } = spawn('npm', ['run', scriptName], {
    cwd: scriptPath,
    event: 'close',
  });

  onclose.catch(async ({ info: { output } }) => failScript(output.toString()));
}

runScript().catch((error) => setFailed(error.message));
