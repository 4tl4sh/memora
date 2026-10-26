import mongoose from 'mongoose'

export { mongoose }

export async function connectDb(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is not defined')
  if (mongoose.connection.readyState === 1) return mongoose
  return mongoose.connect(uri)
}

export async function disconnectDb() {
  await mongoose.disconnect()
}
