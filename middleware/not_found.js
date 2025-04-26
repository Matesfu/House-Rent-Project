const {StatusCodes}= require('http-status-codes')
const notFound= (req, res)=>{
    res.status(StatusCodes.NOT_FOUND).json({error: 'Not Found'})
}

module.exports= notFound