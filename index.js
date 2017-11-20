var linebot = require('linebot');
var express = require('express');
var mysql = require('mysql');
const line = require('@line/bot-sdk');
var schedule = require('node-schedule');
var i=0;
var start=0;
var content;
var type;
<<<<<<< HEAD
var qresult_id;
var channelAccessTokenvalue = "yRdxnDImp5x5V8pYeEYMDapOGMG/Z2y039kFLPs7C5dzuHCvqlQ0kzBGh8gU9RA+giWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/iqVPZNwKE0Pm7QxfDZhIbLpa9Cyr7p8srLAmefShCisgdB04t89/1O/w1cDnyilFU="
var recorded;
var updated;
//-------------------------------------------------------------------------
//連結linebot
var bot = linebot({
	channelId: "1537329241",
	channelSecret: "f2fa2f19f62b0236c16cd977bf013648",
	channelAccessToken: channelAccessTokenvalue
=======
var usercheck = false;
// var responsecheck = false


//-------------------------------------------------------------------------
//連結linebot
var bot = linebot({
  channelId: "1537329241",
  channelSecret: "f2fa2f19f62b0236c16cd977bf013648",
  channelAccessToken:"yRdxnDImp5x5V8pYeEYMDapOGMG/Z2y039kFLPs7C5dzuHCvqlQ0kzBGh8gU9RA+giWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/iqVPZNwKE0Pm7QxfDZhIbLpa9Cyr7p8srLAmefShCisgdB04t89/1O/w1cDnyilFU="
>>>>>>> 3f7213073d2ec3aec71fa693f9adbd1e2721710f

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
<<<<<<< HEAD
	console.log("收到訊息");
	var userid = event.source.userId;
	var message = event.message.text;

	// simple check
	// client.pushMessage(userid,{type: 'text',text: '收到'});
  	con.query("SELECT * FROM `user` WHERE `userid` = '"+userid+"'", function (err, result) {
  		if (err) throw err;
  		if(result.length!=0){
  			start = result[0].flag;
  			i = result[0].question_num;
  			console.log(userid+":"+i);
  			updated=true;
  			record();
  		}

  	})

  	var checkid ="SELECT *  FROM `user` WHERE `userid` = '" + userid +"'"
  	con.query(checkid, function (err, result) {
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
  		var alluser ="SELECT *  FROM `user`";
  		con.query(alluser, function (err, result) {
  			if (err) throw err;
  			con.query("SELECT `content`,`type`  FROM `question` WHERE id = 1", function (err, result2) {

		  		var j=result.length;
	  			for (k=0; k<j; k++){
	  				userid = result[k].userid;
			   		con.query("UPDATE `user` SET `flag`=1, `question_num`=1 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;})
		    		con.query("INSERT INTO question_result (userid) VALUES ('"+userid +"')", function (err, result) {if (err) throw err;})
		    		client.pushMessage(result[k].userid,{type: 'text',text: "你可以開始問卷了"});
			   		start=1;
			   		i=1;
			   		content = result2[0].content;
	  				type = result2[0].type;
		  			client.pushMessage(userid,{type: 'text',text: content});
				};

	  		});
  		});
  	};

function record(){
		if(updated){
			if(start === 1){
	  			console.log("接收答案");
			  	if(message >=1 && message <=10 && type==="scale"){
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
	  			};
	  		}
	  		else{
    			client.pushMessage(userid,{type: 'text',text: "現在還不能填問卷喔"});
	  		};
	  	};
	};
	function ask(){
		if(updated){
  			con.query("SELECT * FROM `user` WHERE `userid` = '"+userid+"'", function (err, result) {
	  				if (err) throw err;
	  					i = result[0].question_num;
		  				if (i <=10 && i>=1){
		  					con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i, function (err, result) {
		  						if (err) throw err;
		  						content = result[0].content;
		  						type = result[0].type;
				  				client.pushMessage(userid,{type: 'text',text: content});
				  			})
				  		}
				  		if(i ===11){
				  			client.pushMessage(userid,{type: 'text',text: "問卷完成囉"});
					   		con.query("UPDATE `user` SET `flag`=0, `question_num`=0 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;})
						}
	
			});
			updated=false;

  		}
  	};


  	function next_q(){
  		if(recorded=true){
  			i++;
  			recorded=false;
  			con.query("UPDATE `user` SET `flag`=1, `question_num`="+i+" WHERE `userid` = '"+userid+"'", function (err, result) {if (err) throw err;});

  		}
  		ask();

  	}
	
=======
	// console.log(event); //把收到訊息的 event 印出來看看
  var userid = event.source.userId;
  var message = event.message.text;
  
  if (userid==="U05a02f4a949c84fd19afebe7483a2e84" && message==="開始問卷"){
    console.log('start');
    i = 1;
    var alluser ="SELECT *  FROM `user`";
    con.query(alluser, function (err, result) {
    if (err) throw err;
    // console.log(result);
    // console.log(result.length);

    var j=result.length;
    // console.log(result[0].userid);

    for (k=0; k<j; k++){
      var userid = result[k].userid
      // console.log(result[k].userid);
      client.pushMessage(result[k].userid,{type: 'text',text: "你可以開始問卷了"});
      con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i, function (err, result) {
        if (err) throw err;
        content = result[0].content;
        type = result[0].type;
        // console.log(content);
        // console.log(type);
        client.pushMessage(userid,{type: 'text',text: content});
        // responsecheck = true;
      })
      con.query("UPDATE `user` SET `flag`=1 WHERE userid = '"+result[k].userid+"'", function (err, result) {if (err) throw err;})  
      start = 1;
    };
  });
  };

  // if(i===0 && usercheck){
    // if (message === '開始問卷') {
    //   i = 1;
    //   console.log(i);
    // }
    // else {
    // client.pushMessage(userid,{type: 'text',text: "現在還不能填問卷喔"});
    // console.log(i);

    // }
  // }

    // console.log("收到訊息");
    // console.log(start);
  if(start === 1){
    // console.log("問卷中");

    if(message >=1 && message <=10 && type==="scale"){
        var sql = "INSERT INTO msg_log (userid, question_id, msg) VALUES ('"+userid +"',"+ i+",'"+message+"')";
        // console.log(sql);
        con.query(sql, function (err, result) {
          if (err) throw err;
          // console.log("1 record inserted");
     
        });
        i++;
        // console.log(i);
  
          // console.log(i);
        }
        else{
          // if(responsecheck){
            client.pushMessage(userid,{type: 'text',text: "資料錯誤，請重新填寫"});
        // }
    }  
  }



  //   if(message !="" &&  type==="text"){

  //     var sql = "INSERT INTO msg_log (userid, question_id, msg) VALUES ('"+userid +"',"+ i+",'"+message+"')";
  // con.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("1 record inserted");
  // });
  //     i++;
  //     // console.log(i);
  //   }    
  if(start === 1){
  if (i <=10 && i>=1){
    con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i, function (err, result) {
      if (err) throw err;
      content = result[0].content;
      type = result[0].type;
      // console.log(content);
      // console.log(type);
      client.pushMessage(userid,{type: 'text',text: content});
      // responsecheck = true;

    })
  };
}


  if(i>10){
    client.pushMessage(userid,{type: 'text',text: '問卷完成囉！'});
    i=0;
    start = 0;
    con.query("UPDATE `user` SET `flag`=0 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;});
  }
  else{
    var checkid ="SELECT *  FROM `user` WHERE `userid` = '" + userid +"'"
    // console.log(checkid);
    con.query(checkid, function (err, result) {
      if (err) throw err;
      // console.log(result);
      // console.log(result.length);
  
      if(result.length === 0){
        var sql = "INSERT INTO user (userid) VALUES ('"+userid +"')";
        // console.log(sql);
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
          usercheck = true;
        });
        client.pushMessage(userid,{type: 'text',text: '很高興認識你'});
      }
      else{
        usercheck = true;
        if(start === 0 && usercheck){
          client.pushMessage(userid,{type: 'text',text: "現在還不能填問卷喔"});
        }
      }
    });
  }
  con.query("SELECT `flag` FROM `user` WHERE `userid` = '"+userid+"'", function (err, result) {
    if (err) throw err;
    start = result[0].flag;
  })
>>>>>>> 3f7213073d2ec3aec71fa693f9adbd1e2721710f

});










<<<<<<< HEAD
//-----------------basic setup---------------------
=======
>>>>>>> 3f7213073d2ec3aec71fa693f9adbd1e2721710f

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
<<<<<<< HEAD
	var port = server.address().port;
	console.log("App now running on port", port);
});

=======
  var port = server.address().port;
  console.log("App now running on port", port);
});



>>>>>>> 3f7213073d2ec3aec71fa693f9adbd1e2721710f
