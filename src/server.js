import WebSocket, { WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'
import { connectDB } from './config/mongoose.js'
import { Session } from './models/session.js'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './validationSchema.cjs'

try {
  const port = process.env.PORT || 8080
  const wss = new WebSocketServer({ port })

  await connectDB()

  // Setup validation using ajv
  const ajv = new Ajv()
  addFormats(ajv, ['uuid'])
  const validate = ajv.compile(schema)

  const sessions = {}
  const clients = {}

  wss.on('connection', ws => {
    ws.on('message', async data => {
      try {
        // console.log('received: %s', data)
        const message = await JSON.parse(data)
        const valid = validate(message)
        if (valid) {
          // Handle pings
          if (message.action === 'ping' && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'pong' }))
          } else if (message.action === 'session-auth') {
            try {
              const session = await Session.authenticate(message.id, message.password)
              if (session) {
                // Add the client to an object keeping check of session clients.
                if (clients[message.id] && !clients[message.id].has(ws)) {
                  clients[message.id].add(ws)
                } else {
                  clients[message.id] = new Set()
                  clients[message.id].add(ws)
                }
                // Fetch database session into memory if needed
                if (!sessions[message.id]) {
                  sessions[session.id] = { instruments: JSON.parse(session.instruments), rolls: JSON.parse(session.rolls) }
                }
                // Add session id to Websocket client object
                ws.id = message.id
                // Send message to confirm that authentication was successful.
                ws.send(JSON.stringify({
                  action: 'session-authenticated'
                }))
              }
            } catch {
              ws.send(JSON.stringify({
                message: 'authentication-failed'
              }))
            }
          } else if (message.action === 'session-create') {
            const uuid = randomUUID()
            sessions[uuid] = { password: message.password, instruments: {}, rolls: {} }
            const session = new Session({
              id: uuid,
              password: message.password,
              instruments: JSON.stringify({}),
              rolls: JSON.stringify({})
            })
            await session.save()
            clients[uuid] = new Set()
            clients[uuid].add(ws)
            ws.id = uuid
            ws.send(JSON.stringify({
              'session-id': uuid
            }))
          } else if (ws.id) {
            // Send the message to every other client connected to the same session.
            for (const client of clients[ws.id].values()) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
              }
            }
            if (message.action === 'note-create') {
              if (sessions[ws.id].rolls[message.roll]) {
                sessions[ws.id].rolls[message.roll][message.note.uuid] = {
                  x: message.note.x,
                  y: message.note.y,
                  length: message.note.length
                }
              } else {
                sessions[ws.id].rolls[message.roll] = {
                  [message.note.uuid]: {
                    x: message.note.x,
                    y: message.note.y,
                    length: message.note.length
                  }
                }
              }
            } else if (message.action === 'note-remove') {
              if (sessions[ws.id].rolls[message.roll][message.note.uuid]) {
                delete sessions[ws.id].rolls[message.roll][message.note.uuid]
              }
            } else if (message.action === 'note-update') {
              for (const [key, value] of Object.entries(message.note)) {
                if (key !== 'uuid') {
                  sessions[ws.id].rolls[message.roll][message.note.uuid][key] = value
                }
              }
            } else if (message.action === 'instrument-create') {
              sessions[ws.id].rolls[message.props.roll] = {}
              sessions[ws.id].instruments[message.uuid] = message.props
            } else if (message.action === 'instrument-update') {
              for (const [key, value] of Object.entries(message.props)) {
                if (key !== 'roll') {
                  sessions[ws.id].instruments[message.uuid][key] = value
                }
              }
            } else if (message.action === 'instrument-remove') {
              if (sessions[ws.id].instruments[message.uuid]) {
                const roll = sessions[ws.id].instruments[message.uuid].roll
                delete sessions[ws.id].rolls[roll]
                delete sessions[ws.id].instruments[message.uuid]
              }
            } else if (message.action === 'session-get') {
              ws.send(JSON.stringify({ action: 'editor-import', instruments: sessions[ws.id].instruments, rolls: sessions[ws.id].rolls }))
            }
          }
        }
      } catch (error) {
        console.error(error)
        console.error('%s', data)
        console.error(validate.errors)
      }
    })
  })

  /**
   * Save sessions in database.
   */
  async function saveSessions () {
    for (const [id, data] of Object.entries(sessions)) {
      await Session.findOneAndUpdate({ id }, {
        rolls: JSON.stringify(data.rolls),
        instruments: JSON.stringify(data.instruments)
      })
    }
  }

  // Save active sessions every minute.
  setInterval(saveSessions, 60000)

  /**
   * Remove inactive clients.
   */
  async function removeInactiveClients () {
    for (const [id, sessionClients] of Object.entries(clients)) {
      for (const client of sessionClients.values()) {
        if (client.readyState === WebSocket.CLOSED) {
          sessionClients.delete(client)
        }
      }
      if (sessionClients.size === 0) {
        await saveSession(id)
        delete sessions[id]
        delete clients[id]
      }
    }
  }

  // Remove inactive clients every thirty seconds.
  setInterval(removeInactiveClients, 30000)

  /**
   * Save a session with a specific id.
   *
   * @param {string} id Id of session to save.
   */
  async function saveSession (id) {
    await Session.findOneAndUpdate({ id }, {
      rolls: JSON.stringify(sessions[id].rolls),
      instruments: JSON.stringify(sessions[id].instruments)
    })
  }
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
