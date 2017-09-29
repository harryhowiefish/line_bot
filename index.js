var linebot = require('linebot');
var express = require('express');
var mysql = require('mysql');
const line = require('@line/bot-sdk');
var i=0;
var content;
var type;


var bot = linebot({
  channelId: "1537329241",
  channelSecret: "86f3c18a761c703d93bdfd4c626eb305",
  channelAccessToken:"1ylgq6lfhGYdX4+dmx06VE6m7Ki/T1D4jC0PIu2NP8TOAf9fh+TkkJLrAo8B4AUCgiWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/gB3iR2BmfbFeAePehKDVhXooG90kzZzbcE8uaUiawrvAdB04t89/1O/w1cDnyilFU="

});

var con = mysql.createConnection({
  host: "harrylinebot.ctwsjipjbutj.ap-southeast-1.rds.amazonaws.com",
  user: "harryhowiefish",
  password: "harryhowiefish",
  database: "linebot_sample"

});

const client = new line.Client({
  channelAccessToken:"1ylgq6lfhGYdX4+dmx06VE6m7Ki/T1D4jC0PIu2NP8TOAf9fh+TkkJLrAo8B4AUCgiWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/gB3iR2BmfbFeAePehKDVhXooG90kzZzbcE8uaUiawrvAdB04t89/1O/w1cDnyilFU="
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

bot.on('message', function(event) {


	// console.log(event); //把收到訊息的 event 印出來看看
  var userid = event.source.userId;
  var message = event.message.text;




  if(i===0){
    if (event.message.text === '開始問卷') {
      i = 1;
      console.log(i);
    }
    else {
      client.pushMessage(event.source.userId,{type: 'text',text: '請輸入「開始問卷」喔'});
    }
  }

    if(event.message.text >=1 && event.message.text <=10 && type==="scale"){
      var sql = "INSERT INTO msg_log (userid, question_id, msg) VALUES ('"+userid +"',"+ i+",'"+message+"')";
      console.log(sql);
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
   
      });
      i++;
      // console.log(i);
    }


    if(event.message.text !="" &&  type==="text"){

      var sql = "INSERT INTO msg_log (userid, question_id, msg) VALUES ('"+userid +"',"+ i+",'"+message+"')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
      i++;
      // console.log(i);
    }    

  if (i <=10 && i>=1){
    con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i, function (err, result) {
      if (err) throw err;
      content = result[0].content;
      type = result[0].type;
      console.log(content);
      console.log(type);
      client.pushMessage(event.source.userId,{type: 'text',text: content});

    })
  };


  if(i>10){
    client.pushMessage(event.source.userId,{type: 'text',text: '問卷完成囉！'});
    i=0;
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