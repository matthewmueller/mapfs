// @ts-check

/**
 * Imports
 */

const stripIndent = require('strip-indent')
const mkdir = require('make-dir')
const util = require('util')
const path = require('path')
const del = require('del')
const fs = require('fs')

/**
 * Promisify write
 */

const writeFile = util.promisify(fs.writeFile)
const readdir = util.promisify(fs.readdir)

/**
 * Exports
 */

module.exports = mapfs

/**
 * New `mapfs`
 *
 * @param {string} root
 * @param {{ [path: string]: string | Buffer }} map
 * @return {Promise<() => Promise<void>>}
 */

async function mapfs(root, map) {
  /** @type {string[]} */
  const filepaths = []
  for (let name in map) {
    // TODO: also support windows
    const parts = name.split('/')
    const filepath = path.join(root, ...parts)
    filepaths.push(filepath)
    await mkdir(path.dirname(filepath))
    // write the data out
    let data = map[name]
    if (typeof data === 'string') {
      data = stripIndent(data.trim())
    }
    await writeFile(filepath, data)
  }
  // create the root anyway if don't have any files
  if (filepaths.length === 0) {
    await mkdir(root)
  }
  // cleanup
  return async function() {
    await Promise.all(filepaths.map(file => del(file)))
    // if we have an empty root directory, also delete it
    if ((await readdir(root)).length === 0) {
      await del(root)
    }
  }
}
