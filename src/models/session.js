import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  id: {
    type: String
  },
  password: {
    type: String
  },
  instruments: {
    type: String
  },
  rolls: {
    type: String
  }
}, {
  timestamps: true
})

export const Session = mongoose.model('Session', sessionSchema)
