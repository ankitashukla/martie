/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var app = express(),
  redis = require("redis"),
    r = redis.createClient();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('This is my secret'));
app.use(express.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/:party/add', function(){
  var trackId = req.body.trackId;
  if(req.session.admin){

  }
  else{
    res.json("You are not admin");
  }
})

app.post('/:party/suggest', function(req, res){
  var trackId = req.body.trackId;
  var patyName = req.param.party
  r.zadd("suggests:"+partyName, 1, trackId);
});

app.post('/:party/upvote', function(req, res){
  var trackId = req.body.trackId;
  var patyName = req.param.party
  r.zincrby("suggests:"+partyName, 1, trackId);
})

/** This is the most important endpoint */
app.get('/:partyName.json', function(req, res){
  r.get("party:"+req.param.partyName, function(err, response){
    console.log([err, response]);
    if(err)
      throw err;
    console.log(response);
    res.json({
      name: response
    })  
  });
  
})
app.get('/:partyName', function(req, res){
  //This is a party page
  //send out different things to different people
  if(req.session.admin){
    res.sendfile("./public/admin.html");
  }
  else{
    res.sendfile("./public/attendee.html");
  }
});

app.get('/', function(req, res){
  res.sendfile("./public/index.html");
});

app.post('/party/create', function(req,res){
  var partyName = req.body.partyname;
  var partyNameSanitized = partyName.replace(/\W/g,'-');
  req.session.admin=true;
  r.set("party:"+partyNameSanitized, partyName);
  res.redirect('/'+partyNameSanitized);
})

app.use(express.static('./public'));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});