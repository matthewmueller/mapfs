import { exists as fsExists, readFile as fsReadFile } from 'fs'
import { strictEqual } from 'assert'
import { promisify } from 'util'
import { join } from 'path'
import mapfs from './'

const exists = promisify(fsExists)
const readFile = promisify(fsReadFile)

describe('mapfs', () => {
  it('should create files', async () => {
    const tmp = join(__dirname, 'tmp')
    const cleanup = await mapfs(tmp, {
      'a.js': 'a',
      'b.js': 'b',
    })
    strictEqual(await exists(join(tmp, 'a.js')), true)
    strictEqual(await exists(join(tmp, 'b.js')), true)
    await cleanup()
    strictEqual(await exists(join(tmp, 'a.js')), false)
    strictEqual(await exists(join(tmp, 'b.js')), false)
    strictEqual(await exists(join(tmp)), false)
  })

  it('should dedent and trim', async () => {
    const tmp = join(__dirname, 'tmp')
    const cleanup = await mapfs(tmp, {
      'a.js': `
        a
      `,
      'b.js': `
        b
      `,
    })
    strictEqual(await exists(join(tmp, 'a.js')), true)
    strictEqual(await exists(join(tmp, 'b.js')), true)
    strictEqual(await readFile(join(tmp, 'a.js'), 'utf8'), 'a')
    strictEqual(await readFile(join(tmp, 'b.js'), 'utf8'), 'b')
    await cleanup()
  })

  it('should cleanup only the files it created', async () => {
    const tmp = join(__dirname, 'tmp')
    const cleanup1 = await mapfs(tmp, {
      'a.js': 'a',
      'b.js': 'b',
    })
    strictEqual(await exists(join(tmp, 'a.js')), true)
    strictEqual(await exists(join(tmp, 'b.js')), true)
    const cleanup2 = await mapfs(tmp, {
      'c.js': 'c',
    })
    strictEqual(await exists(join(tmp, 'a.js')), true)
    strictEqual(await exists(join(tmp, 'b.js')), true)
    strictEqual(await exists(join(tmp, 'c.js')), true)
    await cleanup2()
    strictEqual(await exists(join(tmp, 'a.js')), true)
    strictEqual(await exists(join(tmp, 'b.js')), true)
    strictEqual(await exists(join(tmp, 'c.js')), false)
    await cleanup1()
    strictEqual(await exists(join(tmp, 'a.js')), false)
    strictEqual(await exists(join(tmp, 'b.js')), false)
    strictEqual(await exists(join(tmp, 'c.js')), false)
    strictEqual(await exists(join(tmp)), false)
  })
})
