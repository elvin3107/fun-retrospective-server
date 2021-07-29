const express = require('express');
const router = express.Router();
const Card =  require('./model');
const { AuthenticateToken } = require('../users/service');

// Get all card from database
router.get('/', AuthenticateToken, async (req, res) => {
    try {
        const allCard = await Card.find();
        res.json(allCard);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Get one card by cardId
router.get('/:cardId', AuthenticateToken, async (req, res) => {
    try {
        const card = await Card.findById(req.params.cardId);
        res.json(card);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Get cards in list cardId
router.post('/listCard', AuthenticateToken, async (req, res) => {
    try {
        const cardIdList = req.body.list;
        let cardList = await Promise.all(cardIdList.map(async (cardId) => await Card.findById(cardId)));
        res.send(cardList);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Create
router.post('/', AuthenticateToken, async (req, res) => {
    const newCard = new Card({
        ownerId: req.body.ownerId,
        content: req.body.content
    });

    try {
        const savedCard = await newCard.save();
        res.json(savedCard);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Delete
router.delete('/:cardId', AuthenticateToken, async (req, res) => {
    try {
        const deletedCard = await Card.deleteOne({_id: req.params.cardId});
        res.json(deletedCard);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Update
router.patch('/:cardId', AuthenticateToken, async (req, res) => {
    try {
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.cardId, req.body, { new: true}
        );

        res.json(updatedCard);
    } catch(err) {
        res.status(400).send(err);
    }
});

module.exports = router;