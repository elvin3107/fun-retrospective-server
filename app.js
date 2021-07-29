const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socket = require('socket.io');
const http = require('http');
const cors = require('cors');
require('dotenv/config');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
    cors: {
      origin: "https://clone-funretro.herokuapp.com",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    }
});

app.use(bodyParser.json());
app.use(cors());

// Connect mongoDB
mongoose.connect(process.env.DB_CONNECTION, 
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false},
    () => console.log('DB connected'));

// Routes
const boardRoute = require('./components/boards');
const userRoute = require('./components/users');
const cardRoute = require('./components/cards');
const authRoute = require('./components/auths');

app.use('/api/board', boardRoute);
app.use('/api/user', userRoute);
app.use('/api/card', cardRoute);
app.use('/api/auth', authRoute);

// IO setup
io.on('connection', (socket) => {
    console.log('new user', socket.id);

    socket.on('join', ({ boardId }) => {
        console.log('user join at', boardId);
        socket.join(boardId);
    })

    socket.on('changeBoardData', ({ boardId, data }) => {
        socket.broadcast.to(boardId).emit('boardDataFromServer', { data });
    })

    socket.on('changeCardData', ({ boardId, data }) => {
        socket.broadcast.to(boardId).emit('cardDataFromServer', { data });
    })

    socket.on('disconnect', () => {
        console.log('user left');
    })
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server run on port ${port}`));