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
 * Filemap type `{ path: contents }`
 */

type Filemap = { [path: string]: string }

/**
 * mapfs function creates a `filemap` at `root`
 * returning a delete function
 */

async function mapfs(root: string, filemap: Filemap): Promise<() => Promise<void>> {
  const filepaths: string[] = []
  for (let name in filemap) {
    const data = stripIndent((filemap[name] || '').trim())
    // TODO: also support windows
    const parts = name.split('/')
    const filepath = join(root, ...parts)
    filepaths.push(filepath)
    await mkdir(dirname(filepath))
    await writeFile(filepath, data)
  }
  return async function() {
    await Promise.all(filepaths.map(file => del(file)))
    // if we have an empty root directory, also delete it
    if ((await readdir(root)).length === 0) {
      await del(root)
    }
  }
}
