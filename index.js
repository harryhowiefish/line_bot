var linebot = require('linebot');
var express = require('express');

var bot = linebot({
  channelId: "1537329241",
  channelSecret: "86f3c18a761c703d93bdfd4c626eb305",
  channelAccessToken:"1ylgq6lfhGYdX4+dmx06VE6m7Ki/T1D4jC0PIu2NP8TOAf9fh+TkkJLrAo8B4AUCgiWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/gB3iR2BmfbFeAePehKDVhXooG90kzZzbcE8uaUiawrvAdB04t89/1O/w1cDnyilFU="

});

bot.on('message', function(event) {
	console.log(event); //把收到訊息的 event 印出來看看

  if (event.message.type = 'text') {
    var msg = event.message.text;
    event.reply(msg).then(function(data) {
      // success 
      console.log(msg);
    }).catch(function(error) {
      // error 
      console.log('error');
    });
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});