const express = require('express');
const mongoose = require('mongoose');

require('./model/db');


const app = express();
const PORT = 5000;


app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
})

app.use(require('./routes/auth'));
app.use(require('./routes/post'));