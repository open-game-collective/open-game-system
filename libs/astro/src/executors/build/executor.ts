/**
 * This is copied from nxtensions/astro@3.5.0
 *
 * The version newer than that wasnt working with SSR
 * and the working version still didn't have a way to
 * generate package jsons that nixpacks needs for deployment
 */

import type { ExecutorContext } from '@nrwl/devkit';
import { logger } from '@nrwl/devkit';
import type { ChildProcess } from 'child_process';
import { fork } from 'child_process';
import { removeSync } from 'fs-extra';
import { resolve } from 'path';
import type { BuildExecutorOptions } from './schema';
import { createLockFile, createPackageJson, getLockFileName } from '@nx/js';
import { writeJsonFile } from '@nx/devkit';
import { writeFileSync } from 'fs';

let childProcess: ChildProcess;

export async function buildExecutor(
  options: BuildExecutorOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  options = normalizeOptions(options);

  const projectRoot = context.workspace.projects[context.projectName].root;

  // TODO: use what's in the Astro config once the CLI API is available.
  // See https://github.com/snowpackjs/astro/issues/1483.
  let outputPath = `dist/${projectRoot}`;
  if (context.target?.outputs?.[0]) {
    outputPath = resolve(
      context.target.outputs[0]
        .replace('{workspaceRoot}', context.root)
        .replace('{projectRoot}', projectRoot)
    );
  }

  if (options.deleteOutputPath) {
    removeSync(outputPath);
  }

  try {
    const exitCode = await runCliBuild(context.root, projectRoot, options);
    // added below
    const builtPackageJson = createPackageJson(
      context.projectName,
      context.projectGraph
    );
    builtPackageJson.type = 'module';

    writeJsonFile(`${outputPath}/package.json`, builtPackageJson);
    const lockFile = createLockFile(builtPackageJson);
    writeFileSync(`${outputPath}/${getLockFileName()}`, lockFile, {
      encoding: 'utf-8',
    });
    // end added

    return { success: exitCode === 0 };
  } catch (e) {
    logger.error(e);

    return { success: false };
  } finally {
    if (childProcess) {
      childProcess.kill();
    }
  }
}

export default buildExecutor;

function runCliBuild(
  workspaceRoot: string,
  projectRoot: string,
  options: BuildExecutorOptions
) {
  return new Promise((resolve, reject) => {
    // TODO: use Astro CLI API once it's available.
    // See https://github.com/snowpackjs/astro/issues/1483.
    childProcess = fork(
      require.resolve('astro'),
      ['build', ...getAstroBuildArgs(projectRoot, options)],
      {
        cwd: workspaceRoot,
        stdio: 'inherit',
      }
    );

    // Ensure the child process is killed when the parent exits
    process.on('exit', () => childProcess.kill());
    process.on('SIGTERM', () => childProcess.kill());

    childProcess.on('error', (err) => {
      reject(err);
    });
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

function normalizeOptions(options: BuildExecutorOptions): BuildExecutorOptions {
  return { deleteOutputPath: true, ...options };
}

function getAstroBuildArgs(
  projectRoot: string,
  options: BuildExecutorOptions
): string[] {
  const args: string[] = ['--root', projectRoot];

  if (options.config) {
    args.push('--config', options.config);
  }
  if (options.drafts) {
    args.push('--drafts');
  }
  if (options.host !== undefined) {
    args.push('--host', options.host.toString());
  }
  if (options.silent) {
    args.push('--silent');
  }
  if (options.site) {
    args.push('site', options.site);
  }
  if (options.verbose) {
    args.push('--verbose');
  }

  return args;
}
