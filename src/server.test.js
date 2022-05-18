const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const ajv = new Ajv()
addFormats(ajv, ['uuid'])

const schema = {
  type: 'object',
  properties: {
    action: {
      type: 'string'
    },
    note: {
      type: 'object',
      properties: {
        x: { type: 'integer', minimum: 0 },
        y: { type: 'integer', minimum: 0, maximum: 87 },
        length: { type: 'integer', minimum: 1 },
        uuid: { type: 'string', format: 'uuid' }
      },
      required: ['uuid']
    },
    roll: {
      type: 'string',
      format: 'uuid'
    },
    uuid: {
      type: 'string',
      format: 'uuid'
    },
    props: {
      type: 'object',
      properties: {
        instrument: { type: 'string' },
        volume: { type: 'number', minimum: -60, maximum: 0 },
        reverb: { type: 'number', minimum: 0, maximum: 1 },
        delay: { type: 'number', minimum: 0, maximum: 1 },
        roll: { type: 'string', format: 'uuid' }
      }
    },
    'keyboard-note': {
      type: 'integer', minimum: 21, maximum: 108
    }
  },
  required: ['action']
}

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


