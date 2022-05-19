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
              enum: ['piano', 'casio', '808', '909', 'cr78', 'room', 'synth', 'pulse', 'square', 'sine', 'amsynth', 'fmsynth']
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
        properties: {
          action: {
            const: 'note-create'
          }
        }
      },
      then: {
        properties: {
          note: {
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
        properties: {
          action: {
            const: 'note-update'
          }
        }
      },
      then: {
        properties: {
          note: {
            required: ['uuid']
          }
        },
        required: ['roll', 'note']
      }
    },
    {
      if: {
        properties: {
          action: {
            const: 'note-remove'
          }
        }
      },
      then: {
        properties: {
          note: {
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
        properties: {
          action: {
            const: 'instrument-create'
          }
        }
      },
      then: {
        properties: {
          props: {
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
        properties: {
          action: {
            const: 'instrument-update'
          }
        }
      },
      then: {
        properties: {
          props: {
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
        properties: {
          action: {
            const: 'instrument-remove'
          }
        }
      },
      then: {
        required: ['uuid']
      }
    },
    {
      if: {
        properties: {
          action: {
            const: 'keyboard-play'
          }
        }
      },
      then: {
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
        properties: {
          action: {
            const: 'keyboard-stop'
          },
          'keyboard-note': true
        }
      },
      then: {
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
        properties: {
          action: {
            const: 'session-auth'
          }
        }
      },
      then: {
        required: ['id', 'password']
      }
    },
    {
      if: {
        properties: {
          action: {
            const: 'session-create'
          }
        }
      },
      then: {
        required: ['password']
      }
    }
  ]
}

module.exports = schema
