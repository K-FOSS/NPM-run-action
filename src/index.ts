// src/index.ts
import { getInput, setFailed } from '@actions/core';
import * as github from '@actions/github';
import spawn from 'advanced-spawn-async';
import { sync } from 'glob';
import { parse } from 'path';
import run from './run';

const githubToken = getInput('github-token');
const scriptName = getInput('scriptName', { required: true });
const octokit = new github.GitHub(githubToken);

interface FailTestArgs {
  pr: number;
  result: string;
}

async function failScript({ pr, result }: FailTestArgs): Promise<void> {
  const message = `\`npm run ${scriptName}\` has failed\n\`\`\`${result}\`\`\``;
  octokit.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: pr,
    body: message,
  });
  setFailed(message);
}

async function runScript(): Promise<void> {
  const { pull_request: pr } = github.context.payload;
  if (!pr) throw new Error('Event payload missing `pull_request`');

  try {
    const filenames = sync(`${process.env.GITHUB_WORKSPACE}/**/package.json`);
    for (const filename of filenames) {
      await run(`npm install`, { cwd: parse(filename).dir });
      const { onclose } = spawn('npm', ['run', scriptName], {
        cwd: parse(filename).dir,
        event: 'close',
      });
      onclose.catch(async (test) => {
        failScript({ pr: pr.number, result: test.info.output.toString() });
      });
    }
  } catch (error) {
    setFailed(error.message);
  }
}

runScript();
