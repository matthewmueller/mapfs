import mapfs = require('./')
import tsd = require('tsd')

tsd.expectType<Promise<() => Promise<void>>>(mapfs('root', {}))
tsd.expectType<Promise<() => Promise<void>>>(mapfs('root', { file: 'ok' }))
tsd.expectType<Promise<() => Promise<void>>>(mapfs('root', { file: new Buffer('ok') }))
