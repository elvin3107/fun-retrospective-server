const express = require('express');
const Board = require('./model');
const Card = require('../cards/model');
const router = express.Router();
const { AuthenticateToken } = require('../users/service');

// Get all boards from database
router.get('/', AuthenticateToken, async (req, res) => {
    try {
        const allBoard = await Board.find();
        res.json(allBoard);
    } catch(err) {
        res.status(400).send(err);
    };
});

// Get all boards by ownerId
router.get('/owner/:userId', AuthenticateToken, async (req, res) => {
    try {
        const allBoard = await Board.find({
            ownerId: req.params.userId
        });
        res.json(allBoard);
    } catch(err) {
        res.status(400).send(err);
    };
});

// Get one board
router.get('/:boardId', AuthenticateToken, async (req, res) => {
    try {
        const board = await Board.findById(req.params.boardId);
        res.json(board);
    } catch(err) {
        res.status(400).send(err);
    };
});

// Create
router.post('/', AuthenticateToken, async (req, res) => {
    const board = new Board({
        ownerId: req.body.ownerId,
        name: req.body.name,
        cooperator: [{
            "userId": req.body.ownerId,
            "voteRemain": 5
        }]
    });

    try {
        const savedBoard = await board.save();
        res.json(savedBoard);
    } catch(err) {
        res.status(400).send(err);
    };
});

// Delete
router.delete('/:boardId', AuthenticateToken, async (req, res) => {
    try {
        const board = await Board.findById(req.params.boardId);

        let cardList = board.detail.WentWell;
        cardList.map(async (card) => await Card.deleteOne({_id: card}));
        cardList = board.detail.ToImprove;
        cardList.map(async (card) => await Card.deleteOne({_id: card}));
        cardList = board.detail.ActionItems;
        cardList.map(async (card) => await Card.deleteOne({_id: card}));

        const deletedBoard = await Board.deleteOne({_id: req.params.boardId});
        res.json(deletedBoard);
    } catch(err) {
        res.status(400).send(err);
    };
});

// Update
router.patch('/:boardId', AuthenticateToken, async (req, res) => {
    try {
        const updatedBoard = await Board.findByIdAndUpdate(
            req.params.boardId, req.body, {new: true}
        );

        res.json(updatedBoard);
    } catch(err) {
        res.status(400).send(err);
    }
});

module.exports = router;