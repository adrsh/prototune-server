# Prototune Server

This is the server for a web based music making application. It can be used to create music collaboratively in real-time when using the client with the server.

The server uses WebSocket for handling communications between clients and the server.

## Requirements

Node, MongoDB

## Installation

```bash
npm install
```

In a .env file you need the following, as an example 
```bash
PORT=8080
DB_CONNECTION_STRING="mongodb://localhost:27017/sessions"
```

To run

```bash
npm run dev
```