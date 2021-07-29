const { object } = require('@hapi/joi');
const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    ownerId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    votes: {
        type: Object,
        default: {
            amount: 0,
            list: []
        }
    },
    comments: {
        type: Object,
        default: {}
    }
});

module.exports = mongoose.model('cards', cardSchema);