const {NotFoundError, ServerError, BadRequestError, UnauthenticatedError, ForbiddenError}= require('../errors')

const checkErrorInst= (error)=>{
    if (
        error instanceof UnauthenticatedError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError ||
        error instanceof BadRequestError
      ) {
        return true
      }
    else {
        return false
    }
}

module.exports= checkErrorInst