import { schema } from './server.js'
const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const ajv = new Ajv()
addFormats(ajv, ['uuid'])
const validate = ajv.compile(schema)

test('Note creation with valid attributes', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Note creation with x value less than zero', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: -1,
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with x value greater than 63', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 64,
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with y value less than zero', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: -1,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with length value less than one', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 0,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with y value greater than 87', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 88,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with invalid note uuid', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1,
      uuid: 'invaliduuidgoeshere'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with invalid roll uuid', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'invaliduuid'
  })).toBe(false)
})

test('Note creation with missing x value', () => {
  expect(validate({
    action: 'note-create',
    note: {
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with missing y value', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with missing length value', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with missing uuid value', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with missing roll uuid value', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    }
  })).toBe(false)
})

test('Note creation with unexpected extra values', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note creation with unexpected extra values inside note', () => {
  expect(validate({
    action: 'note-create',
    note: {
      x: 0,
      y: 0,
      length: 1,
      z: 0,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note removal with valid values', () => {
  expect(validate({
    action: 'note-remove',
    note: {
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Note removal without note uuid', () => {
  expect(validate({
    action: 'note-remove',
    note: {},
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note removal without roll uuid', () => {
  expect(validate({
    action: 'note-remove',
    note: {
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    }
  })).toBe(false)
})

test('Note removal without roll and note', () => {
  expect(validate({
    action: 'note-remove'
  })).toBe(false)
})

test('Note removal with unexpected note values', () => {
  expect(validate({
    action: 'note-remove',
    note: {
      x: 0,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note removal with unexpected values', () => {
  expect(validate({
    action: 'note-remove',
    note: {
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note update with valid attributes', () => {
  expect(validate({
    action: 'note-update',
    note: {
      x: 1,
      y: 1,
      length: 2,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Note update with only x value', () => {
  expect(validate({
    action: 'note-update',
    note: {
      x: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Note update with only y value', () => {
  expect(validate({
    action: 'note-update',
    note: {
      y: 1,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Note update with only length value', () => {
  expect(validate({
    action: 'note-update',
    note: {
      length: 2,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Note update without roll uuid', () => {
  expect(validate({
    action: 'note-update',
    note: {
      length: 2,
      uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
    }
  })).toBe(false)
})

test('Note update with no note attributes', () => {
  expect(validate({
    action: 'note-update',
    note: {},
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Note update without note uuid', () => {
  expect(validate({
    action: 'note-update',
    note: {
      x: 1
    },
    roll: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Instrument creation with valid attributes', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      reverb: 0,
      delay: 0
    }
  })).toBe(true)
})

test('Instrument creation with volume greater than 0', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: 1,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with volume less than than -60', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -61,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with volume as a string', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: '-5',
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with invalid reverb value', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      reverb: 2,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with invalid delay value', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      reverb: 0,
      delay: -1
    }
  })).toBe(false)
})

test('Instrument creation with invalid instrument value', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 1,
      volume: -5,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with unexpected attribute', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      reverb: 0,
      delay: 0,
      number: 1
    }
  })).toBe(false)
})

test('Instrument creation with invalid roll uuid', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'invaliduuid',
      instrument: 'piano',
      volume: -5,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with invalid uuid', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'invaliduuid',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with missing roll uuid', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      instrument: 'piano',
      volume: -5,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with missing instrument', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      volume: -5,
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with missing volume', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      reverb: 0,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with missing reverb', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      delay: 0
    }
  })).toBe(false)
})

test('Instrument creation with missing delay', () => {
  expect(validate({
    action: 'instrument-create',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    props: {
      roll: 'efa2765b-dfe0-4476-8220-e70b706421e7',
      instrument: 'piano',
      volume: -5,
      reverb: 0
    }
  })).toBe(false)
})

test('Instrument removal with valid attributes', () => {
  expect(validate({
    action: 'instrument-remove',
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(true)
})

test('Instrument removal with invalid uuid', () => {
  expect(validate({
    action: 'instrument-remove',
    uuid: 'invaliduuid'
  })).toBe(false)
})

test('Instrument removal without uuid', () => {
  expect(validate({
    action: 'instrument-remove'
  })).toBe(false)
})

test('Session get with valid attributes', () => {
  expect(validate({
    action: 'session-get'
  })).toBe(true)
})

test('Keyboard play with valid attributes', () => {
  expect(validate({
    action: 'keyboard-play',
    'keyboard-note': 60
  })).toBe(true)
})

test('Keyboard stop with valid attributes', () => {
  expect(validate({
    action: 'keyboard-stop',
    'keyboard-note': 60
  })).toBe(true)
})

test('Keyboard play without keyboard-note', () => {
  expect(validate({
    action: 'keyboard-play'
  })).toBe(false)
})

test('Keyboard stop without keyboard-note', () => {
  expect(validate({
    action: 'keyboard-stop'
  })).toBe(false)
})

test('Keyboard play with keyboard-note value less than 21', () => {
  expect(validate({
    action: 'keyboard-play',
    'keyboard-note': 20
  })).toBe(false)
})

test('Keyboard play with keyboard-note value greater than 108', () => {
  expect(validate({
    action: 'keyboard-play',
    'keyboard-note': 109
  })).toBe(false)
})

test('Keyboard stop with keyboard-note value less than 21', () => {
  expect(validate({
    action: 'keyboard-stop',
    'keyboard-note': 20
  })).toBe(false)
})

test('Keyboard stop with keyboard-note value greater than 108', () => {
  expect(validate({
    action: 'keyboard-stop',
    'keyboard-note': 109
  })).toBe(false)
})

test('Keyboard play with unexpected properties', () => {
  expect(validate({
    action: 'keyboard-play',
    'keyboard-note': 60,
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Keyboard stop with unexpected properties', () => {
  expect(validate({
    action: 'keyboard-stop',
    'keyboard-note': 60,
    uuid: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Empty message', () => {
  expect(validate({})).toBe(false)
})

test('Session authentication with password', () => {
  expect(validate({
    action: 'session-auth',
    id: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    password: 'hej123'
  })).toBe(true)
})

test('Session authentication with empty password', () => {
  expect(validate({
    action: 'session-auth',
    id: 'efa2765b-dfe0-4476-8220-e70b706421e7',
    password: ''
  })).toBe(true)
})

test('Session authentication without password', () => {
  expect(validate({
    action: 'session-auth',
    id: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Session authentication without id', () => {
  expect(validate({
    action: 'session-auth'
  })).toBe(false)
})

test('Session creation with password', () => {
  expect(validate({
    action: 'session-create',
    password: 'hej123'
  })).toBe(true)
})

test('Session creation with empty password', () => {
  expect(validate({
    action: 'session-create',
    password: ''
  })).toBe(true)
})

test('Session authentication without password', () => {
  expect(validate({
    action: 'session-create',
    id: 'efa2765b-dfe0-4476-8220-e70b706421e7'
  })).toBe(false)
})

test('Ping message', () => {
  expect(validate({
    action: 'ping'
  })).toBe(true)
})
