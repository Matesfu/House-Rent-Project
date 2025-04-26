require('dotenv').config();
const http= require('http')
const app= require('./app')
const connectDB= require('./database/connect')
const PORT= process.env.PORT || 3000
const server= http.createServer(app)

async function startServer(){
    try {
        await connectDB(process.env.URI_MONGO)
        console.log("database connected")
        server.listen(PORT, ()=>{
            console.log(`Listening on port ${PORT}....`)
        })
    } catch (error) {
        console.log(error); 
    }
    
}
startServer()