/**
 * Imports
 */

import util from 'util'
import path from 'path'
import fs from 'fs'

/**
 * Promisify write
 */

const writeFile = util.promisify(fs.writeFile)
// const readdir = util.promisify(fs.readdir)
const unlink = util.promisify(fs.unlink)
const rmdir = util.promisify(fs.rmdir)
const mkdir = util.promisify(fs.mkdir)
const stat = util.promisify(fs.stat)

/**
 * Export `mapfs`
 */

export = mapfs

/**
 * mapfs creates a set of files within a directory
 */

async function mapfs(
  root: string,
  map: { [path: string]: string | Buffer }
): Promise<() => Promise<void>> {
  let cleanup: string[] = []
  for (let name in map) {
    const parts = name.split('/')
    const filepath = path.join(root, ...parts)
    const dirs = await makeDir(path.dirname(filepath))
    await writeFile(filepath, map[name])
    cleanup.push(filepath)
    cleanup.push(...dirs)
  }
  // create the root anyway if don't have any files
  if (Object.keys(map).length === 0) {
    cleanup.push(...(await makeDir(root)))
  }
  // cleanup
  return async function() {
    cleanup = cleanup.sort((a, b) => b.localeCompare(a))
    for (let i = 0; i < cleanup.length; i++) {
      const path = cleanup[i]
      const stats = await stat(path)
      if (stats.isDirectory()) {
        await rmdir(path)
      } else {
        await unlink(path)
      }
    }
  }
}

//
// Based on: https://github.com/sindresorhus/make-dir/blob/master/index.js
//
const mode = 0o777 & ~process.umask()
async function makeDir(pth: string, dirs: string[] = []): Promise<string[]> {
  try {
    await mkdir(pth, mode)
    dirs.push(pth)
    return dirs
  } catch (error) {
    if (error.code === 'EPERM') {
      throw error
    }
    if (error.code === 'ENOENT') {
      const dirname = path.dirname(pth)
      if (dirname === pth) {
        throw permissionError(pth)
      }
      if (error.message.includes('null bytes')) {
        throw error
      }

      await makeDir(dirname, dirs)
      await makeDir(pth, dirs)
    }
    // exists but not a directory
    const stats = await stat(pth)
    if (!stats.isDirectory()) {
      throw error
    }
    return dirs
  }
}
function permissionError(pth: string): Error {
  // This replicates the exception of `fs.mkdir` with native the
  // `recursive` option when run on an invalid drive under Windows.
  const error: any = new Error(`operation not permitted, mkdir '${pth}'`)
  error.code = 'EPERM'
  error.errno = -4048
  error.path = pth
  error.syscall = 'mkdir'
  return error
}
