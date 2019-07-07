# mapfs

A little utility function for easily creating files to help with testing.

## Install

```sh
yarn add mapfs
```

## Example

```ts
import { join } from 'path'
import mapfs from 'mapfs'

const tmp = join(__dirname, 'tmp')
const cleanup = await mapfs(tmp, {
  'test/test.js': `
    console.log('test')
  `
  'a.js': `
    console.log('a')
  `
  'b/b.js': `
    console.log('a')
  `
})

// ...run some tests...

// cleanup the created files
await cleanup()
```

## License

MIT
