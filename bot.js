var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var currentwar;
var warlist = {};
var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/cool guy$/,
      warRegex = /^\/war (.*)$/,
      listRegex = /^\/warlist$/,,
      calloutRegex = /^\/callout (\d*)/;

  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage(cool());
    this.res.end();
  }
  else if (request.text && warRegex.test(request.text) ) {
    this.res.writeHead(200);
    currentwar = true;
    var match = warRegex.exec(request.text);
    postMessage("War has been declared against " + match[1]);
    warlist = {};
    this.res.end();
  }

  else if (request.text && calloutRegex.test(request.text) ) {
    this.res.writeHead(200);
    postMessage();
    var match = calloutRegex.exec(request.text);
    warlist[match[1]] = request.name; 
    
    this.res.end();
  }
   else if (request.text && listRegex.test(request.text) ) {
    this.res.writeHead(200);
    postMessage(JSON.stringify(warlist));
    this.res.end();
  }
   
  else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }

}

function postMessage(message) {
  var botResponse, options, body, botReq;

  botResponse = message;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
