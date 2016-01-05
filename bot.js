var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var currentwar;
var warlist = {};
var attachment = false;
var attachments = [];

var botID = process.env.BOT_ID;

// A function to pretty print the JSON
function pretty(inpj) {
    
    var retval = "";

    for(var key in inpj) {
        retval = retval.concat(key + " : " + inpj[key] + "\n"); 
    }
    
    if (retval === "")
        retval = "No targets called yet"

    return retval;
}

var tagAll = function(members) {

  var msg = '';

  var mentions = [];

  var loci = [];

  var index = 0;

  for(member in members) {
    mentions.push(members[member].user_id);

    msg += '@' + members[member].nickname+' ';
    
    // +1 for the @
    loci.push([index, index + members[member].nickname.length + 1]);

    // leave a character for the space as well
    index += members[member].nickname.length + 2;
  }

  attachments.push({
    "type": "mentions",
    "loci": loci,
    "user_ids": mentions
  });

  attachment = true;

  postMessage(msg);
}


function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/cool guy$/,
      warRegex = /^\/war (.*)$/,
      listRegex = /^\/warlist$/,
      calloutRegex = /^\/callout (\d*)/,
      deleteRegex = /^\/delete (\d*)$/,
      sexRegex = /^\/sex$/;
      clanRegex=/^\/clan$/;

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
    var match = calloutRegex.exec(request.text);
    warlist[match[1]] = request.name; 
    
    postMessage("Target " + match[1] + " has been called by " + request.name);
    this.res.end();
  }
   else if (request.text && listRegex.test(request.text) ) {
    this.res.writeHead(200);
    postMessage(pretty(warlist));
    this.res.end();
  }
  else if (request.text && deleteRegex.test(request.text) ) {
    this.res.writeHead(200);
    var match = deleteRegex.exec(request.text);
    delete warlist[match[1]];
    postMessage("Call on target " + match[1] + " has been deleted.");
    this.res.end();
  }
  else if (request.text && sexRegex.test(request.text) ) {
    this.res.writeHead(200);
    postMessage("This Chat is fucking Cancer.");
    this.res.end();
  }

  else if (request.text && clanRegex.test(request.text) ) {
    this.res.writeHead(200);
    currentwar = true;
    
    if (request.name == 'Avi (One star specialist first class)' || request.name == 'Ryann' || request.name == 'LaMotta 34') {
      getChannelUserList(tagAll);
    }

    else {
      postMessage("Sorry, you're not allowed to do that");
    }

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

  if (attachment == true) {

    body["attachments"] = attachments;
    attachment = false;
    attachments = [];
  }

  console.log(body);

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


// Ping the groupme API for a list of all users on this channel.
function getChannelUserList(callback) {

    // group id for the Bandits chat
    var group_id = 10323393;

    var url = "https://api.groupme.com/v3/groups/10323393?token=" + process.env.TOKEN;

    HTTPS.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var fbResponse = JSON.parse(body);

            callback(fbResponse.response.members);
        });

    }).on('error', function(e){
          console.log("Got an error: ", e);
    });

};