"use strict";

var config = require('../config');
var db = require('../dao/LoginDao');
var SessionUtils = require('../utils/SessionUtils');

require('date-utils');

exports.userLogin = function (req, res, next) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	console.log("request login....");
	db.login(username, password,function (err, doc) {
	    if (err) {
	        return next(err);
	    }
	    //console.log(doc);
		var userObj = {'username':username, isStore:false,test:'test'};
		if(doc.ret == 0)
		{
			SessionUtils.sessionError(req, doc.message);
			res.redirect('/login');
		}
		else
		{
			if(doc.ret == 2){
				userObj.isStore = true;
				req.session.store = {
					storeId:doc.store._id,
					title:doc.store.title,
					availabled_date:doc.store.availabled_date.toFormat("YYYY-MM-DD")
				};
				console.log("管理员登陆成功，", req.session.store);
			}
			else if(doc.ret == 1){
				userObj.userId = doc.user._id;
			}
			req.session.user = userObj;
			res.redirect('/admin');
		}
	});
};

exports.userRegister = function (req, res, next) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	var email = req.body.email || '';

	db.register(username, password, email,function (err, doc) {
	    if (err) {
	        return next(err);
	    }
        //req.session.user = {'username':username};
	    res.render('message.html', doc);
	});
};

//忘记密码
exports.userForget = function (req, res, next) {
	var email = req.body.email || '';

	db.forget(email,function (err, doc) {
	    if (err) {
	        return next(err);
	    }
	    res.json(doc);
	});
};

exports.users = function (req, res, next) {
	db.users(function (err, doc) {
	    if (err) {
	        return next(err);
	    }
	    res.json(doc);
	});
};

exports.edit = function (req, res, next) {
	if (!req.session.user){
		res.redirect('/login');
		return;
	}
	var userId = req.session.user.userId;
	db.findByObj({_id:userId}, function (err, doc) {
		if (err) {
			return next(err);
		}
		//console.log("edit:", doc);
		res.render("admin/admin_user_info.html",{user:req.session.user, todo:doc});
	});
};

exports.save = function (req, res, next) {
	var userId = req.body.userid;
	db.findByObj({_id:userId}, function (err, doc) {
		if (err) {
			res.json({ret:0,msg:"修改个人信息失败"});
			return;
		}
		doc.iphone = req.body.iphone;
		doc.email = req.body.email;
		doc.name = req.body.name;
		doc.notice = req.body.notice;
		doc.save(function(err){
			if(err) {
				res.json({ret:0,msg:"修改个人信息失败"});
				//req.session.errmsg = "修改个人信息失败";
			}
			res.json({ret:1,msg:"修改个人信息成功"});
			//res.redirect("/user/"+doc._id+"/edit");
		});
	});
};

exports.updatePwd = function (req, res, next) {
	var username = req.session.user.username;
	var pwd = req.body.pwd;
	var newPwd = req.body.newPwd;
	var newPwdTwo = req.body.newPwdTwo;

	//console.log("updatePwd:", pwd, newPwd, newPwdTwo, req.body);

	if (newPwd == newPwdTwo)
	{
		if (newPwd == pwd)
		{
			res.json({ret:0,msg:"新密码与原密码一致"});
		}
		else {
			db.findUserById(username, function (err, doc) {
				if (err)
				{
					res.json({ret:0,msg:"修改密码错误"});
				}
				if (doc) {
					console.log("updatePwd:",doc);
					if (doc.password == pwd) {
						doc.password = newPwd;
						doc.save(function(err) {
							if (err) {
								util.log('FATAL '+ err);
								res.json({ret:0,msg:"修改密码错误"});
							}
							else
							{
								res.json({ret:1,msg:"修改密码成功"});
							}
						});
					}
					else {
						res.json({ret:0,msg:"原密码错误"});
					}
				}
			});
		}
	}
	else
	{
		res.json({ret:0,msg:"密码两次输入不一致！"});
	}
};

exports.checkEmail = function (req, res, next) {
	var email = req.body.email;
	var id = req.body.userId;
	var emailCode = req.body.emailCode;

	res.render('admin/check_email.html',{email:email, id:id});
};

exports.checkIphone = function (req, res, next) {
	var iphone = req.body.iphone;
	var id = req.body.userId;
	var iphoneCode = req.body.iphoneCode;
	res.render('admin/check_iphone.html',{iphone:iphone, id:id});
};
