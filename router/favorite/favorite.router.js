const express= require("express")
const {getFavoriteProperty, removeFavoriteProperty, addToFavorite}= require('./favorite.controller')
const favoriteRouter= express.Router()

favoriteRouter.route('/').get(getFavoriteProperty).patch(addToFavorite)
favoriteRouter.route('/:id').delete(removeFavoriteProperty)


module.exports= favoriteRouter