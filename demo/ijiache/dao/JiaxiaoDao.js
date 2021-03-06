var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//定义JiaXiao对象模型
var JiaXiaoScheme = new Schema({
    title:String,
    finished:{type:Boolean,default:false},
    post_date:{type:Date,default:Date.now}
});

//访问todo对象模型
mongoose.model('t_jiaxiao', JiaXiaoScheme);
var Todo = mongoose.model('t_jiaxiao');

exports.add = function(title,callback) {
    var newTodo = new Todo();
    newTodo.title = title;
    newTodo.save(function(err){
        if(err){
            util.log("FATAL"+err);
            callback(err);
        }else{
            callback(null);
        }
    });

}

exports.delete = function(id, callback) {
    exports.findTodoById(id, function(err, doc) {
        if (err)
            callback(err);
        else {
            util.log(util.inspect(doc));
            doc.remove();
            callback(null);
        }
    });
}

exports.editTitle = function(id, title, callback) {
    exports.findTodoById(id, function(err, doc) {
        if (err)
            callback(err);
        else {
            doc.post_date = new Date();
            doc.title = title;
            doc.save(function(err) {
                if (err) {
                    util.log('FATAL '+ err);
                    callback(err);
                } else
                    callback(null);
            });
        }
    });
}
exports.editFinished = function(id, finished, callback) {
    exports.findTodoById(id, function(err, doc) {
        if (err)
            callback(err);
        else {
            doc.post_date = new Date();
            doc.finished = finished;
            doc.save(function(err) {
                if (err) {
                    util.log('FATAL '+ err);
                    callback(err);
                } else
                    callback(null);
            });
        }
    });
}

exports.allJiaxiaos = function(callback) {
    Todo.find({}, callback);
}

exports.forAll = function(doEach, done) {
    Todo.find({}, function(err, docs) {
        if (err) {
            util.log('FATAL '+ err);
            done(err, null);
        }
        docs.forEach(function(doc) {
            doEach(null, doc);
        });
        done(null);
    });
}

var findTodoById = exports.findTodoById = function(id,callback){
    Todo.findOne({_id:id},function(err,doc){
        if (err) {
            util.log('FATAL '+ err);
            callback(err, null);
        }
        callback(null, doc);
    });
}


