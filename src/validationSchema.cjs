const schema = {
  allOf: [
    {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['note-create', 'note-update', 'note-remove', 'instrument-create', 'instrument-update', 'instrument-remove', 'keyboard-play', 'keyboard-stop', 'session-auth', 'session-get', 'session-create', 'ping']
        },
        note: {
          type: 'object',
          properties: {
            x: { type: 'integer', minimum: 0, maximum: 63 },
            y: { type: 'integer', minimum: 0, maximum: 87 },
            length: { type: 'integer', minimum: 1 },
            uuid: { type: 'string', format: 'uuid' }
          },
          additionalProperties: false
        },
        roll: {
          type: 'string',
          format: 'uuid'
        },
        uuid: {
          type: 'string',
          format: 'uuid'
        },
        id: {
          type: 'string',
          format: 'uuid'
        },
        props: {
          type: 'object',
          properties: {
            instrument: {
              type: 'string',
              enum: ['piano', 'casio', 'clarinet', '808', '909', 'cr78', 'room', 'bedroom', 'synth', 'pulse', 'square', 'sine', 'triangle', 'sawtooth']
            },
            volume: { type: 'number', minimum: -60, maximum: 0 },
            reverb: { type: 'number', minimum: 0, maximum: 1 },
            delay: { type: 'number', minimum: 0, maximum: 1 },
            roll: { type: 'string', format: 'uuid' }
          },
          additionalProperties: false,
          minProperties: 1
        },
        'keyboard-note': {
          type: 'integer', minimum: 21, maximum: 108
        },
        password: {
          type: 'string',
          maxLength: 64
        }
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'note-create'
          }
        }
      },
      then: {
        type: 'object',
        properties: {
          note: {
            type: 'object',
            required: ['x', 'y', 'length', 'uuid']
          },
          roll: true,
          action: true
        },
        required: ['action', 'roll', 'note'],
        additionalProperties: false
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'note-update'
          }
        }
      },
      then: {
        type: 'object',
        properties: {
          note: {
            type: 'object',
            required: ['uuid']
          }
        },
        required: ['roll', 'note']
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'note-remove'
          }
        }
      },
      then: {
        type: 'object',
        properties: {
          note: {
            type: 'object',
            properties: {
              uuid: true
            },
            required: ['uuid'],
            additionalProperties: false
          },
          roll: true,
          action: true
        },
        required: ['action', 'roll', 'note'],
        additionalProperties: false
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'instrument-create'
          }
        }
      },
      then: {
        type: 'object',
        properties: {
          props: {
            type: 'object',
            required: ['roll', 'instrument', 'volume', 'reverb', 'delay']
          },
          action: true,
          uuid: true
        },
        required: ['action', 'props', 'uuid'],
        additionalProperties: false
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'instrument-update'
          }
        }
      },
      then: {
        type: 'object',
        properties: {
          props: {
            type: 'object',
            properties: {
              roll: false
            }
          },
          action: true,
          uuid: true
        },
        required: ['action', 'props', 'uuid'],
        additionalProperties: false
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'instrument-remove'
          }
        }
      },
      then: {
        type: 'object',
        required: ['uuid']
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'keyboard-play'
          }
        }
      },
      then: {
        type: 'object',
        properties: {
          action: true,
          'keyboard-note': true
        },
        required: ['action', 'keyboard-note'],
        additionalProperties: false
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'keyboard-stop'
          },
          'keyboard-note': true
        }
      },
      then: {
        type: 'object',
        properties: {
          action: true,
          'keyboard-note': true
        },
        required: ['action', 'keyboard-note'],
        additionalProperties: false
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'session-auth'
          }
        }
      },
      then: {
        type: 'object',
        required: ['id', 'password']
      }
    },
    {
      if: {
        type: 'object',
        properties: {
          action: {
            const: 'session-create'
          }
        }
      },
      then: {
        type: 'object',
        required: ['password']
      }
    }
  ]
}

module.exports = schema
