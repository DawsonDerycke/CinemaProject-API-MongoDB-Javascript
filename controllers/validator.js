const joi = require('joi');

const userSchema = joi.object({
    username: joi.string().min(2).max(25).required(),
    password: joi.string().min(2).max(25).required(),
});

const categorySchema = joi.object({
    title: joi.string().min(1).max(80).required(),
    category: joi.string().min(3).max(25).required(),
    duration: joi.number().integer().min(5).max(600).required(),
    director: joi.string().min(3).max(25).required(),
    actor: joi.string().min(3).max(25).required(),
});

const customerSchema = joi.object({
    firstName: joi.string().min(2).max(25).required(),
    year: joi.number().integer().min(1).max(120).required(),
    movie: joi.string().min(1).max(80).required(),
    seat: joi.string().min(1).max(4).required(),
    ticket: joi.boolean().required(),
});

const movieSchema = joi.object({
    title: joi.string().min(1).max(80).required(),
    price: joi.number().min(1).max(15).required(),
    yearRequired: joi.number().valid(0, 3, 7, 12, 18),
    releaseDate: joi.string().pattern(new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')),
});

const ratingSchema = joi.object({
    rating: joi.number().min(0).max(5).required(),
});

module.exports = {
    userSchema,
    categorySchema,
    customerSchema,
    movieSchema,
    ratingSchema,
};

