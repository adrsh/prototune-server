import WebSocket, { WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'
import { connectDB } from './config/mongoose.js'
import { Session } from './models/session.js'
import assert from 'assert'

try {
  const wss = new WebSocketServer({ port: process.env.PORT })

  await connectDB()

  const sessions = {}
  const clients = {}

  // Handle pings from client.
  wss.on('connection', ws => {
    ws.on('message', data => {
      try {
        const message = JSON.parse(data)
        if (message === 'ping' && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify('pong'))
        }
      } catch (error) {
        console.error('An error occured')
      }
    })
  })

  wss.on('connection', ws => {
    ws.on('message', async data => {
      try {
        const message = JSON.parse(data)
        if (message.action === 'session-auth') {
          const session = await Session.findOne({ id: message.id })
          if (session && session.password === message.password) {
          // Add the client to an object keeping check of session clients.
            if (clients[message.id] && !clients[message.id].has(ws)) {
              clients[message.id].add(ws)
            } else {
              clients[message.id] = new Set()
              clients[message.id].add(ws)
            }
            // Fetch database session into memory if needed
            if (!sessions[message.id]) {
              sessions[session.id] = { password: session.password, instruments: JSON.parse(session.instruments), rolls: JSON.parse(session.rolls) }
            }
            // Add session id to Websocket client object
            ws.id = message.id
            // Send message to confirm that authentication was successful.
            ws.send(JSON.stringify({
              action: 'session-authenticated'
            }))
          } else {
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
        }
      } catch (error) {
        console.error(error)
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
  async function removeClients () {
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
  setInterval(removeClients, 30000)

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

  /**
   * Validate incoming message.
   *
   * @param {Object} message Message to validate.
   */
  function validateMessage (message) {
    console.log(message)
    if (message.action === 'note-create') {
      assert(message.note.x >= 0, 'X needs to be greater than 0')
      assert(message.note.y >= 0, 'Y needs to be greater than 0')
    }
  }

  wss.on('connection', ws => {
    ws.on('message', data => {
      console.log('received: %s', data)
      if (ws.id) {
        try {
          const message = JSON.parse(data)
          validateMessage(message)
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
            for (const [key, value] of Object.entries(message.changes)) {
              if (key !== 'uuid') {
                sessions[ws.id].rolls[message.roll][message.changes.uuid][key] = value
              }
            }
          } else if (message.action === 'instrument-create') {
            sessions[ws.id].rolls[message.props.roll] = {}
            sessions[ws.id].instruments[message.uuid] = {
              roll: message.props.roll,
              instrument: message.props.instrument
            }
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
        } catch (error) {
          console.error('Message contained invalid data: ' + data)
        }
      }
      // console.log(clients)
      // console.log(sessions)
    })
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
