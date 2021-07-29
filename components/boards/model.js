const mongoose = require('mongoose');

const boardSchema = mongoose.Schema({
    ownerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    cardNum: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    detail: {
        type: Object,
        default: {
            "WentWell": [],
            "ToImprove": [],
            "ActionItems": []
        }
    },
    cooperator: {
        type: Array,
        required: true
    }
}); 

module.exports = mongoose.model('boards', boardSchema);