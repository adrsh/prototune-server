import WebSocket, { WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'

try {
  const wss = new WebSocketServer({ port: process.env.PORT })

  const sessions = {}
  const clients = {}

  wss.on('connection', ws => {
    ws.on('message', data => {
      const message = JSON.parse(data)
      if (message.action === 'session-auth') {
        console.log(sessions[message.id])
        if (sessions[message.id] && message.password === sessions[message.id].password) {
          // Antingen en slags sessionslista
          if (!clients[message.id].includes(ws)) {
            clients[message.id].push(ws)
          }
          // Eller sätta sessions-idt på ws-objektet, eftersom det inte kan ändras från klienten?
          // Men då kanske man måste iterera mellan alla klienter för att skicka till rätt mottagare?
          ws.id = message.id
          // Eller både och? Då vet man ju vilken session som ws-objektet är förknippad med.
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
        sessions[uuid] = { password: message.password, instruments: {}, storage: {} }
        clients[uuid] = []
        ws.id = uuid
        ws.send(JSON.stringify({
          'session-id': uuid
        }))
      }
    })
  })

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
          if (sessions[ws.id].storage[message.roll]) {
            sessions[ws.id].storage[message.roll][message.note.uuid] = {
              x: message.note.x,
              y: message.note.y,
              length: message.note.length
            }
          } else {
            sessions[ws.id].storage[message.roll] = {
              [message.note.uuid]: {
                x: message.note.x,
                y: message.note.y,
                length: message.note.length
              }
            }
          }
        } else if (message.action === 'note-remove') {
          if (sessions[ws.id].storage[message.roll][message.note.uuid]) {
            delete sessions[ws.id].storage[message.roll][message.note.uuid]
          }
        } else if (message.action === 'note-update') {
          for (const [key, value] of Object.entries(message.changes)) {
            if (key !== 'uuid') {
              sessions[ws.id].storage[message.roll][message.changes.uuid][key] = value
            }
          }
        } else if (message.action === 'instrument-create') {
          sessions[ws.id].storage[message.props.roll] = {}
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
            delete sessions[ws.id].storage[roll]
            delete sessions[ws.id].instruments[message.uuid]
          }
        } else if (message.action === 'session-get') {
          ws.send(JSON.stringify({ action: 'editor-import', instruments: sessions[ws.id].instruments, rolls: sessions[ws.id].storage }))
        }
      }
      console.log(clients)
      console.log(sessions)
    })
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
