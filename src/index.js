const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose  = require('mongoose');
const app = express();

app.use(bodyParser.json());



mongoose.connect("mongodb+srv://Project-1:6H3EsS0qOKLtWR0B@cluster0.hln3nud.mongodb.net/P1?retryWrites=true&w=majority",
    {
        useNewUrlParser: true
    })
    .then(() => console.log("Database connected..."))
    .catch(err => console.log(err));


app.use('/', route);

app.use((req, res) => {
    const error = new Error('/Path not found/');
    return res.status(404).send({status: 'ERROR', error: error.message})
});


app.listen( 3000, () => {
    console.log('Express app listening on port ' + 3000)
});
