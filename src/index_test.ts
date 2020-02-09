import importFrom from 'import-from'
import testaway from 'testaway'
import assert from 'assert'
import tempy from 'tempy'
import path from 'path'
import util from 'util'
import mapfs from './'
import fs from 'fs'

const readFile = util.promisify(fs.readFile)
const exists = util.promisify(fs.exists)
const tmp = path.join(__dirname, 'tmp')

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  'base64'
)

describe('mapfs', function() {
  this.timeout('10s')

  it('empty should work', async function() {
    const cleanup = await mapfs(tmp, {})
    await cleanup()
  })

  it('should create & cleanup files', async function() {
    const tmp = path.join(__dirname, 'tmp')
    const cleanup = await mapfs(tmp, {
      'a.js': 'a',
      'b.js': '  b  ',
      'c/c/c/c/c/c.js': 'c',
      'd.png': png,
    })
    assert.equal(await readFile(path.join(tmp, 'a.js')), 'a')
    assert.equal(await readFile(path.join(tmp, 'b.js')), '  b  ')
    assert.equal(
      await readFile(path.join(tmp, 'c', 'c', 'c', 'c', 'c', 'c.js')),
      'c'
    )
    assert.ok((await readFile(path.join(tmp, 'd.png'))).equals(png))
    await cleanup()
    assert.equal(await exists(path.join(tmp)), false)
  })

  it('testaway', async function() {
    this.timeout('20s')
    const tmpdir = tempy.directory()
    await testaway(tmpdir, path.join(__dirname, '..'))
    const fn = await importFrom(tmpdir, 'mapfs')
    assert.equal(typeof fn, 'function')
  })
})
