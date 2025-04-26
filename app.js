const express= require('express')
const router= require('./router')

const app= express()
// error handler
const notFoundMiddleware = require('./middleware/not_found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json())
app.use('/api', router)
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


module.exports= app