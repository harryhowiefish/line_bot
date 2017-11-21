var linebot = require('linebot');
var express = require('express');
var mysql = require('mysql');
const line = require('@line/bot-sdk');
var schedule = require('node-schedule');
var channelAccessTokenvalue = "2VMlMDkyoFm35S+Zu936V5NUZTLReBHbwcvXfhIpP7rLtXnWgXY4bRAZbgrHtRZAgiWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/hh2lh6dGwCspfip/eU7b9CBg39Q9nETYLwN1VNmGRwvQdB04t89/1O/w1cDnyilFU="

//-------------------------------------------------------------------------
//連結linebot
var bot = linebot({
	channelId: "1537329241",
	channelSecret: "f2fa2f19f62b0236c16cd977bf013648",
	channelAccessToken: channelAccessTokenvalue


});
//連結sql
var con = mysql.createConnection({
	host: "harrylinebot.ctwsjipjbutj.ap-southeast-1.rds.amazonaws.com",
	user: "harryhowiefish",
	password: "harryhowiefish",
	database: "linebot_sample"

});

const client = new line.Client({
	channelAccessToken:channelAccessTokenvalue
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

//-------------------------------------------------------------------------


bot.on('message', function(event) {
	console.log("收到訊息");
  var recorded;
  var updated;
  var input_error;
  var i=0;
  var start=0;
  var content;
  var type;
  var qresult_id;
	var userid = event.source.userId;
	var message = event.message.text;

	// simple check
	// client.pushMessage(userid,{type: 'text',text: '收到'});
  	con.query("SELECT `userid`,`flag`,`question`.`id`,`content` FROM `user` left join `question`on `user`.`question_num`=`question`.`id`WHERE `userid` = '"+userid+"'", function (err, result) {
  		if (err) throw err;
  		if(result.length!=0){
  			start = result[0].flag;
  			i = result[0].id;
        content = result[0].content;
  			console.log(userid+":"+i);
  			updated=true;
  			record();
  		}

  	});

  	con.query("SELECT *  FROM `user` WHERE `userid` = '" + userid +"'", function (err, result) {
  		if (err) throw err;
  		if(result.length === 0){
  			var sql = "INSERT INTO user (userid) VALUES ('"+userid +"')";
       		con.query(sql, function (err, result) {
       			if (err) throw err;
       			console.log("1 record inserted");
       		});
       		client.pushMessage(userid,{type: 'text',text: '很高興認識你'});
   		};
    });


  	if (userid==="U05a02f4a949c84fd19afebe7483a2e84" && message==="開始問卷"){
  		console.log('start');
  		var alluser ="SELECT * FROM `user`";
  		con.query(alluser, function (err, result) {
  			if (err) throw err;
  			con.query("SELECT `content`,`type`  FROM `question` WHERE id = 1", function (err, result2) {
		  		var j=result.length;
	  			for (k=0; k<j; k++){
            userid=result[k].userid;
			   		con.query("UPDATE `user` SET `flag`=1, `question_num`=1 WHERE userid = '"+userid+"'", function (err, result) {
              if (err) throw err;
            });
            client.pushMessage(userid,{type: 'text',text: "你可以開始問卷了"});
            start=1;
		    		con.query("INSERT INTO question_result (userid) VALUES ('"+userid +"')", function (err, result) {if (err) throw err;})
            content = result2[0].content;
            type = result2[0].type;
            start_questionaire();
				  };
	  		});
  		});
  	};

  function record(){
		if(updated){
			if(start === 1){
			  	if(message >=1 && message <=10 ){
            console.log("接收答案");
			  	  con.query("INSERT INTO msg_log (userid, question_id, msg) VALUES ('"+userid +"',"+ i+",'"+message+"')", function (err, result) {if (err) throw err;});
            con.query("SELECT max(id) as id  from `question_result` where userid='"+userid+"'",function(err,result){
						if (err) throw err;
						qresult_id=result[0].id;
						con.query("UPDATE `question_result` SET `Q_"+i+"`="+message+" WHERE `id` ='"+qresult_id+"'", function (err, result) {
							if (err) throw err;
							recorded=true;
						});
						next_q();
					});
			  	}
			  	else{
			  		client.pushMessage(userid,{type: 'text',text: "資料錯誤，請重新填寫"});
            input_error=true;
            askagain();
	  			};
	  		}
	  		else{
    			client.pushMessage(userid,{type: 'text',text: "現在還不能填問卷喔"});
	  		};
	  	};
	};

	function ask(){
		if(updated){
		  if (i <=10 && i>=1){
        con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i , function (err, result) {
          content=result[0].content;
		  	  client.pushMessage(userid,{type: 'text',text: content});
		  	});
      }
			if(i ===11){
				client.pushMessage(userid,{type: 'text',text: "問卷完成囉"});
					con.query("UPDATE `user` SET `flag`=0, `question_num`=0 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;})
			}
	
		};
			updated=false;
  };

  function askagain(){
    if(input_error){
      if (i <=10 && i>=1){
        client.pushMessage(userid,{type: 'text',text: content});
      }
      if(i ===11){
        client.pushMessage(userid,{type: 'text',text: "問卷完成囉"});
          con.query("UPDATE `user` SET `flag`=0, `question_num`=0 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;})
      }
  
    };
      input_error=false;
  };

  function next_q(){
		if(recorded=true){
 		  i++;
      console.log(i);
		  recorded=false;
		  con.query("UPDATE `user` SET `flag`=1, `question_num`="+i+" WHERE `userid` = '"+userid+"'", function (err, result) {if (err) throw err;});
  	}
  	ask();
    console.log("this comes after i");
  };

  function start_questionaire(){
    if(start===1){
      client.pushMessage(userid,{type: 'text',text: content});
    }
  }

});
	
	



//-----------------basic setup---------------------

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
	var port = server.address().port;
	console.log("App now running on port", port);
});
