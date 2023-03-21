require('dotenv').config()
const express=require('express')
const app=express()
const mongoose=require('mongoose')

mongoose.connect
(
    process.env.MONGODB_URI,
    {
        dbName:process.env.DB_NAME,
        user:process.env.DB_USER,
        pass:process.env.DB_PASS,
        useNewUrlParser:true
    }
)

const db=mongoose.connection
db.on('error',(error) => console.log(error))
db.once('open',() => console.log('Connected to AskPu Database'))
db.on('disconnected',() =>console.log('Database Disconnected'))

const AskpuRoutes=require('./routes/askpu.routes')
app.use('/askpu',AskpuRoutes)

const port=process.env.PORT||3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})