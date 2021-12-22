require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
//----------------------------------------------

//database
const mySecret = process.env['MONGO_URI'];
mongoose.connect(mySecret, {userNewUrlParser: true, useUnifiedTopology: true});

//SCHEMA
const urlSchema = mongoose.Schema({
  "url": 'string'
});

//MODEL
const Url = mongoose.model('Url', urlSchema);

//----------------------------

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const path = '/api/shorturl';
app.post(path, (request, response) => {
  const bodyURL = request.body.url;
  console.log(bodyURL);
  
  const test = dns.lookup(urlparser.parse(bodyURL).hostname, (error, address) => {
    if(!address) {
      response.json({"error": "Invalid URL"})
    }else {
      const url = new Url({"url": bodyURL});
      url.save((error, data) => {
        if (error) return console.log(error);
      response.json({
        "original_url": data.url,
        "short_url": data.id
      })
    })
    }
    console.log("dns", error);
    console.log("address", address);
  })
  console.log("test", test);
});


const newPath = '/api/shorturl/:id';
app.get(newPath, (request, response) => {
const id = request.params.id;
Url.findById(id, (error, data) => {
  if (!data) {
    response.json({"error": "Invalid URL"});
  }else {
   response.redirect(data.url);
  }
})
});

