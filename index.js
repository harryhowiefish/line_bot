var linebot = require('linebot');
var express = require('express');
var mysql = require('mysql');
const line = require('@line/bot-sdk');
var schedule = require('node-schedule');
var async = require('async');

var channelAccessTokenvalue = "2VMlMDkyoFm35S+Zu936V5NUZTLReBHbwcvXfhIpP7rLtXnWgXY4bRAZbgrHtRZAgiWIS34dhJt7k9EXToy5CMrvmfPxQPwLy3P+kTvTy/hh2lh6dGwCspfip/eU7b9CBg39Q9nETYLwN1VNmGRwvQdB04t89/1O/w1cDnyilFU="

//-------------------------------------------------------------------------
//連結linebot
var bot = linebot({
  channelId: "1537329241",
  channelSecret: "291f1613b1cd07d9c036453fe7466218",
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

var rule = new schedule.RecurrenceRule();
var start=0;
var timetable= [];
rule.minute = 0;  


var update_schedule_rule = new schedule.RecurrenceRule();
update_schedule_rule.second = [30];

con.query("SELECT `hour`  FROM `timetable` WHERE is_publish = 1", function (err, result) {
  var j=result.length;
  timetable = [];
  for (k=0; k<j; k++){
    timetable.push(result[k].hour);
  };
  rule.hour = timetable;
  console.log(timetable);
});

var update_schedule = schedule.scheduleJob(update_schedule_rule,function(){
  con.query("SELECT `hour`  FROM `timetable` WHERE is_publish = 1", function (err, result) {
    var j=result.length;
    timetable = [];
    for (k=0; k<j; k++){
      timetable.push(result[k].hour);
    };
    rule.hour = timetable;
    console.log(timetable);
  });
});


//-------------------------------------------------------------------------
var trigger = schedule.scheduleJob(rule, function(){
  console.log('trigger');
  console.log('start');
  var n = new Date();
  console.log(n.getHours()+":"+n.getMinutes());
  start_prompt_1();
  start_prompt_2();
});


//-------------------------------------------------------------------------


bot.on('message', function(event) {
  console.log("收到訊息");
  var recorded;
  var i=0;
  var content;
  var type;
  var qresult_id;
  var userid = event.source.userId;
  var message = event.message.text;
  var launch = 0;
  var max_num;
  var name;
  var admin;
  var group;
  var first_content;
  con.query("SELECT `userid`,`flag`,`is_admin`,`question`.`id`,`content`, `min_num`, `max_num` FROM `user` left join `question`on `user`.`question_num`=`question`.`id`WHERE `userid` = '"+userid+"'", function (err, result) {
    if (err) throw err;
    if(result.length!=0){
      start = result[0].flag;
      i = result[0].id;
      content = result[0].content;
      max_num = result[0].max_num;
      min_num = result[0].min_num;
      admin = result[0].is_admin;
      record();
      console.log('管理員判斷：'+ admin);
    };

    client.getProfile(userid).then((profile) =>{
      name = profile.displayName;
    });
  
    con.query("SELECT *  FROM `user` WHERE `userid` = '" + userid +"'", function (err, result) {
      if (err) throw err;
      if(result.length === 0){
        var sql = "INSERT INTO user (userid,name) VALUES ('"+userid + "','" + name +"')";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
          });
          client.pushMessage(userid,{type: 'text',text: '很高興認識你'});
      };
    });
  
    if (admin==1 && message.includes("手動開始")){
      console.log('manuel triggered');
      group = Number(message.substr(1,1));
      if(Number.isInteger(group)){
        start_questionaire_1();
        start_questionaire_2();
        client.pushMessage(userid,{type: 'text',text: '指令完成'});
      };
    }
    else if(admin==1 && message.includes("開始排程")){
      console.log('start schedule');
      group = Number(message.substr(1,1));
      if(Number.isInteger(group)){
        console.log('ok')
        var alluser ="SELECT * FROM `user` where `group` = "+group;
        con.query(alluser, function (err, result) {
          if (err) throw err;
          var j=result.length;
          for (k=0; k<j; k++){
            userid=result[k].userid;
            con.query("UPDATE `user` SET `schedule`=1 WHERE userid = '"+userid+"'", function (err, result) {
              if (err) throw err;
            });
          };
        });
        client.pushMessage(userid,{type: 'text',text: '指令完成'});
      };
    }
    else if(admin==1 && message.includes("停止排程")){
      console.log('stop schedule');
      group = Number(message.substr(1,1));
      if(Number.isInteger(group)){
        console.log('ok')
        var alluser ="SELECT * FROM `user` where `group` = "+group;
        con.query(alluser, function (err, result) {
          if (err) throw err;
          var j=result.length;
          for (k=0; k<j; k++){
            userid=result[k].userid;
            con.query("UPDATE `user` SET `schedule`=0 WHERE userid = '"+userid+"'", function (err, result) {
              if (err) throw err;
            });
          };
        });
        client.pushMessage(userid,{type: 'text',text: '指令完成'});
      };  
    }
    else if(admin==1 && message.includes("結算")){
      console.log('calculate result');
      group = Number(message.substr(1,1));
      if(Number.isInteger(group)){
        con.query("select `question_result`.`userid`,`group`, count(`question_result`.`userid`), sum(`status`), sum(`status`)/count(`question_result`.`userid`)*100 as rate from `question_result` left join `user` on `user`.`userid` = `question_result`.`userid` group by `userid`", function (err, result) {
          var j=result.length;
          for (k=0; k<j; k++){
            userid=result[k].userid;
            var rate = result[k].rate;
            client.pushMessage(userid,{type: 'text',text: '您的問卷完成率為：'+rate+'%'});
          };
        });
        client.pushMessage(userid,{type: 'text',text: '指令完成'});
      };
    }
    else{
      client.pushMessage(userid,{type: 'text',text: '指令錯誤'});
    };    
  });

//-------------------------------------------------------------------------

  function record(){
    if(start === 1){
      if(message >=min_num && message <=max_num ){
        console.log("答案："+message);
        con.query("INSERT INTO msg_log (userid, question_id, msg) VALUES ('"+userid +"',"+ i+",'"+message+"')", function (err, result) {if (err) throw err;});
        con.query("SELECT max(id) as id  from `question_result` where userid='"+userid+"'",function(err,result){
        if (err) throw err;
        qresult_id=result[0].id;
        con.query("UPDATE `question_result` SET `Q_"+i+"`="+message+" , `update_at` = CURRENT_TIMESTAMP WHERE `id` ='"+qresult_id+"'", function (err, result) {
          if (err) throw err;
          if (i>=5){
            con.query("UPDATE `question_result` SET `status`=1 WHERE `id` ='"+qresult_id+"'", function (err, result) {
            if (err) throw err; 
            });    
          };
          recorded=true;
        });
        if(i==1 && message==0){
          console.log('skip');
          skip_q();
        }
        else{
          console.log('next');
          next_q();
        };
      });
      }
      else{
        input_error();
      };
    }
    else{
      client.pushMessage(userid,{type: 'text',text: "現在還不能填問卷喔"});
    };
  };

  function ask(){
    if (i <=8 && i>=1 || i === 10){
      con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i , function (err, result) {
        content=result[0].content;
        client.pushMessage(userid,{type: 'text',text: content});
      });
    }
    else if(i === 11){
      client.pushMessage(userid,{type: 'text',text: "問卷完成囉"});
        con.query("UPDATE `user` SET `flag`=0, `question_num`=0 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;})
    }
    else if (i === 9){
          con.query("SELECT `content`,`type`  FROM `question` WHERE id = "+i, function (err, result) {
            if (err) throw err;
            content = result[0].content;
            type = result[0].type;
            pictureandtext();
      })
    };  
  };

  function input_error(){
    client.pushMessage(userid,{type: 'text',text: "資料錯誤，請重新填寫"});
    setTimeout(ask,500);
  };

  function next_q(){
    if(recorded=true){
      i++;
      recorded=false;
      con.query("UPDATE `user` SET `flag`=1, `question_num`="+i+" WHERE `userid` = '"+userid+"'", function (err, result) {if (err) throw err;});
    }
    ask();
  };

  function skip_q(){
    if(recorded=true){
      i=i+2;
      recorded=false;
      con.query("UPDATE `user` SET `flag`=1, `question_num`="+i+" WHERE `userid` = '"+userid+"'", function (err, result) {if (err) throw err;});
    }
    ask();
  };

  function start_questionaire_2(){
    var alluser ="SELECT * FROM `user` left join `question` on `question_num` = `question`.`id` where `group` = "+group;
    con.query(alluser, function (err, result) {
      if (err) throw err;    
      var j=result.length;    
      for (var k=0;k<j;k++){
        userid=result[k].userid;
        console.log(userid);
        console.log(k);
        content=result[0].content;
        con.query("UPDATE `user` SET `flag`=1, `question_num`=1 WHERE userid = '"+userid+"'", function (err, result) {if (err) throw err;});
        con.query("INSERT INTO question_result (userid) VALUES ('"+userid +"')", function (err, result) {if (err) throw err;});
        console.log('發問題');
        console.log('send to:'+userid);
        client.pushMessage(userid,{type: 'text',text: content});
      };
    });
  };

  function start_questionaire_1(){
    var alluser ="SELECT * FROM `user` left join `question` on `question_num` = `question`.`id` where `group` = "+group;
    con.query(alluser, function (err, result) {
      if (err) throw err;    
      var j=result.length;    
      for (var k=0;k<j;k++){
        userid=result[k].userid;
        console.log(userid);
        console.log(k);
        console.log('發訊息');
        console.log('send to:'+userid);
        client.pushMessage(userid,{type: 'text',text: "你可以開始填寫問卷了"});
      };
    });
  };
  


  function follow_text(){
    client.pushMessage(userid,{type: 'text',text: content});
  };

  function pictureandtext(){
    client.pushMessage(userid,{type: "image",originalContentUrl: "https://i.imgur.com/nRzOPAP.png",previewImageUrl: "https://i.imgur.com/nRzOPAP.png"});
    setTimeout(follow_text,500);
  };

  function next_person(){
    k++;
  };
  /////////////////
});

  
  
function start_prompt_2(){
  var alluser ="SELECT * FROM `user` left join `question` on `question_num` = `question`.`id` where `schedule` = 1";
  con.query(alluser, function (err, result) {
    if (err) throw err;
    var j=result.length;
    for (k=0; k<j; k++){
      userid=result[k].userid;
      content = result[k].content;
      client.pushMessage(userid,{type: 'text',text: content});
      console.log('發問題');
      console.log('send to:'+userid);
    };
  });
};

function start_prompt_1(){
  var alluser ="SELECT * FROM `user` left join `question` on `question_num` = `question`.`id` where `schedule` = 1";
  con.query(alluser, function (err, result) {
    if (err) throw err;
    var j=result.length;
    for (k=0; k<j; k++){
      userid=result[k].userid;
      con.query("UPDATE `user` SET `flag`=1, `question_num`=1 WHERE userid = '"+userid+"'", function (err, result) {
        if (err) throw err;
      });
      con.query("INSERT INTO question_result (userid) VALUES ('"+userid +"')", function (err, result) {if (err) throw err;})
      client.pushMessage(userid,{type: 'text',text: "你可以開始問卷了"});
      console.log('發訊息');
      console.log('send to:'+userid);
    };
  });
};



//-----------------basic setup---------------------

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});
