const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid');
const API_KEY = "2abbf7c3-245b-404f-9473-ade729ed4653";
const jsonParser = bodyParser.json();
const app = express();

function keyManager(req, res, next){
  let token = req.headers.authorization;
  let apiKey = req.headers['book-api-key'];
  let queryApiKey = req.query.API_KEY;
  
  if (!token && !apiKey && !queryApiKey){
    res.statusMessage = "No key provided";
    return res.status(401).end();
  }
  
  if(token){
    if(token !== `Bearer ${API_KEY}`){
      res.statusMessage = "Invalid key";
      return res.status(401).end();
    }
  }
  
  if(apiKey){
    if(apiKey !== API_KEY){
      res.statusMessage = "Invalid key";
      return res.status(401).end();
    }
  }
  
  if (queryApiKey){
    if (queryApiKey !== API_KEY){
      res.statusMessage = "Invalid key";
      return res.status(401).end();
    }
  }
	
  next();
};

app.use(morgan('dev'));
app.use(keyManager);

let bookmarks = [
	{
		id : uuid.v4(),
		title : "Google",
		description : "Google site",
		url : "https://www.google.com",
		rating : 10
	},
	{
		id : uuid.v4(),
		title : "Twitter",
		description : "Twitter site",
		url : "https://www.twitter.com",
		rating : 9
	},
	{
		id : uuid.v4(),
		title : "Facebook",
		description : "Facebook site",
		url : "https://www.facebook.com",
		rating : 8
	},
	{
		id : uuid.v4(),
		title : "YouTube",
		description : "YouTube site",
		url : "https://www.youtube.com",
		rating : 7
	}
];

app.get('/bookmarks', (req,res)=> {
	console.log("Returning all the bookmarks");
	return res.status(200).json(bookmarks);
});

app.get('/bookmark', (req,res)=> {
  let title = req.query.title;
  if (! title){
    res.statusMessage = "No title has been provided";
    return res.status(406).end();
  }
  let result = [];
  for(var i in bookmarks){
    if(bookmarks[i].title === title){
      result.push(bookmarks[i]);
    }
  }
  if (result.length === 0){
    res.statusMessage = "The title wasnt found";
    return res.status(404).end();
  }
  return res.status(200).json(result);
});

app.post('/bookmarks', jsonParser ,(req,res)=> {
  console.log("body", req.body);
  if(!req.body) {
    res.statusMessage = "Parameters not provided";
    return res.status(406).end();
  }
  if(!req.body.title || !req.body.description || !req.body.url || !req.body.rating){
    res.statusMessage = "Missing parameters";
    return res.status(406).end();
  }
  let id = uuid.v4();
  let title = req.body.title;
  let description = req.body.description;
  let url = req.body.url;
  let rating = req.body.rating;
  let bookmarkNew = {id,title,description,url,rating};
  bookmarks.push(bookmarkNew);

  return res.status(201).json(bookmarkNew);
});

app.patch('/bookmark/:id', jsonParser , (req,res) => {

  if (! req.body.id){
    res.statusMessage = "Body is missing";
    return res.status(406).end();
  }

  if (req.params.id !== req.body.id){
    res.statusMessage = "IDs don't match";
    return res.status(409).end();
  }
  let index = -1;

  for(var i in bookmarks){
    if(bookmarks[i].id === req.body.id){
      index = i;
    }
  }

  if (index === -1){
    res.statusMessage = "ID don't match";
    return res.status(404).end();
  }

  if(req.body.title){
    bookmarks[index].title = req.body.title;
  }
  if(req.body.description){
    bookmarks[index].description = req.body.description;
  }
  if(req.body.url){
    bookmarks[index].url = req.body.url;
  }
  if(req.body.rating){
    bookmarks[index].rating = req.body.rating;
  }

  return res.status(202).json(bookmarks[index]);
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});