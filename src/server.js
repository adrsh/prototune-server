import WebSocket, { WebSocketServer } from 'ws'

try {
  const wss = new WebSocketServer({ port: process.env.PORT })

  const storage = {}

  wss.on('connection', function connection (ws) {
    ws.send(Buffer.from(JSON.stringify({ action: 'note-import', notes: storage })))
    ws.on('message', function message (data) {
      wss.clients.forEach(function each (client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data)
        }
      })
      console.log('received: %s', data)
      const message = JSON.parse(data)
      if (message.action === 'note-create') {
        if (storage[message.roll]) {
          storage[message.roll][message.note.uuid] = {
            x: message.note.x,
            y: message.note.y,
            length: message.note.length
          }
        } else {
          storage[message.roll] = {
            [message.note.uuid]: {
              x: message.note.x,
              y: message.note.y,
              length: message.note.length
            }
          }
        }
      } else if (message.action === 'note-remove') {
        if (storage[message.roll][message.note.uuid]) {
          delete storage[message.roll][message.note.uuid]
        }
      } else if (message.action === 'note-update') {
        for (const [key, value] of Object.entries(message.changes)) {
          if (key !== 'uuid') {
            storage[message.roll][message.changes.uuid][key] = value
          }
        }
      }
      console.log(storage)
    })
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
