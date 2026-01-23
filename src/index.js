import connectDB from './db/index.js'
import dotenv from 'dotenv'
import { app } from './app.js'

dotenv.config()

const PORT = process.env.PORT || 3000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  })
