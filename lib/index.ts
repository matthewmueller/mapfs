/**
 * Dependencies
 */

import { writeFile as fsWriteFile, readdir as fsReaddir } from 'fs'
import stripIndent from 'strip-indent'
import { join, dirname } from 'path'
import { promisify } from 'util'
import mkdir from 'make-dir'
import del from 'del'

/**
 * Promisify write
 */

const writeFile = promisify(fsWriteFile)
const readdir = promisify(fsReaddir)

/**
 * Export `mapfs`
 */

export = mapfs

/**
 * mapfs function creates a `filemap` at `root`
 * returning a delete function
 */

async function mapfs(root: string, map: { [path: string]: string }): Promise<() => Promise<void>> {
  const filepaths: string[] = []
  for (let name in map) {
    const data = stripIndent((map[name] || '').trim())
    // TODO: also support windows
    const parts = name.split('/')
    const filepath = join(root, ...parts)
    filepaths.push(filepath)
    await mkdir(dirname(filepath))
    await writeFile(filepath, data)
  }
  // create the root anyway if don't have any files
  if (filepaths.length === 0) {
    await mkdir(root)
  }
  return async function() {
    await Promise.all(filepaths.map(file => del(file)))
    // if we have an empty root directory, also delete it
    if ((await readdir(root)).length === 0) {
      await del(root)
    }
  }
}
