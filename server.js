const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
const path = require('path')
// const dotenv = require('dotenv')
const bodyParser = require('body-parser')

// PORT
const PORT = process.env.PORT || 3000

const app = express()

// load config
// dotenv.config({path: './config/config.env'})

// connect to mongodb
connectDB()
  .then(() => {
    // Set up express to listen
    app.listen(PORT, console.log(`Server running on port ${PORT}`))
  })

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(bodyParser())

// Routes

app.use('/', require('./routes/index'))
app.use('/soundslips', require('./routes/soundslips'))
