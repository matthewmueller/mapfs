// @ts-check

/**
 * Imports
 */

const util = require('util')
const path = require('path')
const test = require('taz')
const mapfs = require('./')
const fs = require('fs')

/**
 * Promisify
 */

const readFile = util.promisify(fs.readFile)
const exists = util.promisify(fs.exists)

/**
 * Tests
 */

test('empty should work', async t => {
  const tmp = path.join(__dirname, 'tmp')
  const cleanup = await mapfs(tmp, {})
  await cleanup()
})

test('should create files', { timeout: '10s' }, async t => {
  const tmp = path.join(__dirname, 'tmp')
  const cleanup = await mapfs(tmp, {
    'a.js': 'a',
    'b.js': 'b',
  })
  t.is(await exists(path.join(tmp, 'a.js')), true)
  t.is(await exists(path.join(tmp, 'b.js')), true)
  await cleanup()
  t.is(await exists(path.join(tmp, 'a.js')), false)
  t.is(await exists(path.join(tmp, 'b.js')), false)
  t.is(await exists(path.join(tmp)), false)
})

test('should dedent and trim', async t => {
  const tmp = path.join(__dirname, 'tmp')
  const cleanup = await mapfs(tmp, {
    'a.js': `
      a
    `,
    'b.js': `
      b
    `,
  })
  t.is(await exists(path.join(tmp, 'a.js')), true)
  t.is(await exists(path.join(tmp, 'b.js')), true)
  t.is(await readFile(path.join(tmp, 'a.js'), 'utf8'), 'a')
  t.is(await readFile(path.join(tmp, 'b.js'), 'utf8'), 'b')
  await cleanup()
})

test('should cleanup only the files it created', async t => {
  const tmp = path.join(__dirname, 'tmp')
  const cleanup1 = await mapfs(tmp, {
    'a.js': 'a',
    'b.js': 'b',
  })
  t.is(await exists(path.join(tmp, 'a.js')), true)
  t.is(await exists(path.join(tmp, 'b.js')), true)
  const cleanup2 = await mapfs(tmp, {
    'c.js': 'c',
  })
  t.is(await exists(path.join(tmp, 'a.js')), true)
  t.is(await exists(path.join(tmp, 'b.js')), true)
  t.is(await exists(path.join(tmp, 'c.js')), true)
  await cleanup2()
  t.is(await exists(path.join(tmp, 'a.js')), true)
  t.is(await exists(path.join(tmp, 'b.js')), true)
  t.is(await exists(path.join(tmp, 'c.js')), false)
  await cleanup1()
  t.is(await exists(path.join(tmp, 'a.js')), false)
  t.is(await exists(path.join(tmp, 'b.js')), false)
  t.is(await exists(path.join(tmp, 'c.js')), false)
  t.is(await exists(path.join(tmp)), false)
})
