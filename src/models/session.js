import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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

sessionSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * Authenticate the user.
 *
 * @param {string} id session id
 * @param {string} password Password
 * @returns {object} Session object
 */
sessionSchema.statics.authenticate = async function (id, password) {
  const session = await this.findOne({ id })
  if (!session || !(await bcrypt.compare(password, session.password))) {
    throw new Error('Invalid authentication attempt.')
  }
  return session
}

export const Session = mongoose.model('Session', sessionSchema)
