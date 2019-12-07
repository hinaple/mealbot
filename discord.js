const klunch = require('k-lunch');
const async = require('async');
const discord = require('discord.js');
const client = new discord.Client();
const TOKEN = "";

client.on("ready", () => {
    console.log("working discord meal!");
});

let list = [];

let form =  {
    year: 2019,
    month: 12,
    day: 6,
    time: 2, // Breakfast = 1, Lunch = 2, Dinner = 3
    name: '봉담중학교',
    phase: 3 // Elementary School = 2, Middle School = 3, High School = 4
};

const options = {
  autoCode: true,
  autoDomain: true
};

const works = [
    (callback) => {
        var date = new Date();
        form.year = date.getFullYear();
        form.month = date.getMonth() + 1;
        form.day = date.getDate();
        callback(null, form);
    },
    (form, callback) => {
        klunch.getLunch(form, (err, output) => {
            if(err) callback(err);
            else callback(null, output, form);
        }, options);
    }/*,
    (form, menu, callback) => {
        klunch.getNutrients(form, (err, output) => {
            if(err) callback(err);
            else callback(null, menu, output, form.name);
        }, options);
    }*/
];

client.on("message", (msg) => {
    if(msg.content.indexOf("M ") === 0) {
        msg.channel.startTyping();
        let schoolName = msg.content.replace("M ", "");
        if(schoolName.substr(schoolName.length - 2) != "학교") {
            if(schoolName.substr(schoolName.length - 1) == "고" ||
            schoolName.substr(schoolName.length - 1) == "초") schoolName += "등학교";
            else schoolName += "학교";
        }
        form.name = schoolName;
        async.waterfall(works, (err, menu, form) => {
            msg.channel.stopTyping();
            if(err) msg.channel.send("급식 혹은 그러한 학교가 없습니다.");
            else {
                let str = "";
                for(let i = 0; i < menu.length; i++) {
                    str += menu[i].menu += "\n";
                }
                let data = new discord.RichEmbed()
                .setColor("RANDOM")
                .setTitle(form.name + "의 오늘 급식 :bento:")
                .setDescription(str)
                .setFooter("Copyrightⓒ2019 fainthit@kakao.com All rights reserved.");
                msg.channel.send(data);
            }
        });
    }
    if(msg.content.indexOf("!auto ") === 0) {
        for(let i = 0; i < list.length; i++) {
            if(msg.author.equals(list[i].user)) {
                clearInterval(list[i].interval);
                list.splice(i, 1);
                break;
            }
        }
        let schoolName = msg.content.replace("!auto ", "");
        if(schoolName.substr(schoolName.length - 2) != "학교") {
            if(schoolName.substr(schoolName.length - 1) == "고" ||
            schoolName.substr(schoolName.length - 1) == "초") schoolName += "등학교";
            else schoolName += "학교";
        }
        list.push({
            user: msg.author,
            school: schoolName,
            interval: setInterval(() => {
                msg.channel.startTyping();
                form.name = schoolName;
                async.waterfall(works, (err, menu, form) => {
                    msg.channel.stopTyping(true);
                    if(!err) {
                        let str = "";
                        for(let i = 0; i < menu.length; i++) {
                            str += menu[i].menu += "\n";
                        }
                        let data = new discord.RichEmbed()
                        .setColor("RANDOM")
                        .setTitle("@" + msg.username + "님, \n" + form.name + "의 오늘 급식입니다. :bento:")
                        .setDescription(str)
                        .setFooter("Copyrightⓒ2019 fainthit@kakao.com All rights reserved.");
                        msg.reply(data);
                    }
                });
            }, 86400000)
        });
        msg.channel.send("매일 이 시간에 " + schoolName + "의 급식이 전송됩니다.\n")
    }
    if(msg.content === "!cancel") {
        for(let i = 0; i < list.length; i++) {
            if(msg.author.equals(list[i].user)) {
                clearInterval(list[i].interval);
                list.splice(i, 1);
                msg.channel.send("저장된 예약 전송이 삭제되었습니다.");
                return;
            }
        }
        msg.channel.send("저장되어 있는 예약 전송이 없습니다.");
    }
});

client.login(TOKEN);