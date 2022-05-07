import WebSocket, { WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'
import { connectDB } from './config/mongoose.js'
import { Session } from './models/session.js'

try {
  const wss = new WebSocketServer({ port: process.env.PORT })

  await connectDB()

  const sessions = {}
  const clients = {}

  wss.on('connection', ws => {
    ws.on('message', async data => {
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
        ws.id = uuid
        ws.send(JSON.stringify({
          'session-id': uuid
        }))
      }
    })
  })

  /**
   * Save sessions in database.
   */
  async function saveSessions () {
    for (const [id, data] of Object.entries(sessions)) {
      await Session.findOneAndUpdate({ id: id }, {
        rolls: JSON.stringify(data.rolls),
        instruments: JSON.stringify(data.instruments)
      })
    }
  }

  // Save active sessions every minute.
  setInterval(saveSessions, 30000)

  /**
   * Remove inactive clients.
   */
  function removeClients () {
    for (const sessionClients of Object.values(clients)) {
      for (const client of sessionClients.values()) {
        if (client.readyState === WebSocket.CLOSED) {
          sessionClients.delete(client)
        }
      }
    }
  }

  // Save inactive clients every three minutes.
  setInterval(removeClients, 30000)

  wss.on('connection', function connection (ws) {
    ws.on('message', function message (data) {
      console.log('received: %s', data)
      if (ws.id) {
        const message = JSON.parse(data)
        for (const client of clients[ws.id]) {
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
      }
      // console.log(clients)
      // console.log(sessions)
    })
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
