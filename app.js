var express = require('express');
var app = express();
var path = require('path');
const session = require('express-session');
var mongoose = require('mongoose');
const User = require('./modals/User');
const Bike = require('./modals/Bike');
const Rent = require('./modals/Rent');
var MongoClient = require('mongodb').MongoClient;
var multer = require('multer');
var url = "mongodb://localhost:27017/";
var formdata = require('form-data');
const { render } = require('ejs');
const { query } = require('express');
app.use(session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    expires: new Date(Date.now() + 3600000), //1 Hour
    resave: false
}));
const nologin = (req, res, next) => {
    sess = req.session;
    if (!sess.name) {
        res.redirect('/login');
    } else {
        next();
    }
}
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    sess = req.session;
    sess.name;
    sess.email;
    res.render('welcome');
});
app.use(express.urlencoded({ extended: false }));
app.get('/register', function(req, res) {
    res.render('register');
})
app.get('/login', function(req, res) {
    res.render('login');
});
app.get('/modals/Users');
app.post('/login', function(req, res) {
    var { name, password, phone, email } = req.body;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project");
        var query = { name: name, password: password };
        dbo.collection("Users").find(query).toArray(function(err, result) {
            if (err) {
                res.render('login');
            } else {
                if (!result[0]) {
                    console.log('no user found')
                    res.render('login');
                } else {
                    sess = req.session;
                    sess.name = result[0].name;
                    sess.phone = result[0].phone;
                    sess.email = result[0].email;
                    global.sn = sess.name;
                    global.phone = sess.phone;
                    global.email = sess.email;
                    console.log(sess);
                    db.close();
                    res.render('dashboard', {
                        sn,
                        phone,
                        email
                    });
                }
            }
        });
    });
});
app.get('/dashboard', nologin, function(req, res) {
    res.render('dashboard');
});
app.post('/register', function(req, res) {
    var { name, email, phone, password, confirmpassword } = req.body;
    let error = []
    if (!name || !email || !phone || !password || !confirmpassword) {
        error.push({ msg: 'please enter the information' });
    }
    if (password !== confirmpassword) {
        error.push({
            msg: 'password not matched'
        });
    }
    if (error.length > 0) {
        res.render('register', {
            error,
            name,
            email,
            phone

        })
        console.log(error);
    } else {
        var newuser = new User({
            name,
            email,
            phone,
            password
        });
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("Project");
            var myobj = { name, phone, password, email };
            dbo.collection("Users").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        });
        console.log(newuser);
        res.redirect('/login');
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, files, cb) {
        cb(null, files.fieldname + '-' + Date.now() + path.extname(files.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: '50mb' },

}).array('pic', 3);
app.post('/lend', function(req, res) {
    sess = req.session;
    if (!sess.name) {
        res.redirect('/login');
    }
    var name = sess.name;
    var phone = sess.phone;
    var loc = req.body.loc;
    var c = req.body.cost;
    var bcc = req.body.bcc;
    var bname = req.body.bname;
    var add = req.body.add;
    var bno = req.body.bn;
    var bikeloc = picloc;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project");
        var random = '"' + Math.round(Math.random() * Math.floor(100)) + '"';
        var myobj = { random, name, phone, loc, c, bcc, bname, add, bno, bikeloc };

        dbo.collection("Bikes").insertOne(myobj, function(err, res) {
            if (err) throw err;

            db.close();
            console.log("1 Bike inserter!");
        });
    });
    res.render('dashboard');
});
app.post('/lend2', function(req, res) {
    sess = req.session;
    if (!sess.name) {
        res.redirect('/login');
    }
    var pic = req.body.pic;
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
        } else {
            if (pic == undefined) {
                global.picloc = res.req.files;
            } else {
                console.log('The filename is ' + res.req.file.filename);
            }
        }
    });
});
app.get('/rent', nologin, function(req, res) {
    res.render('dashboard')
})
app.get('/lend', nologin, function(req, res) {
    res.render('dashboard')
})
app.get('/lend2', nologin, function(req, res) {
    res.render('dashboard')
})
app.post('/rent', function(req, res, err) {
    sess = req.session;
    if (!sess.name) {
        res.redirect('/login');
    }
    var name = sess.name;
    var phone = sess.phone;
    var loc = req.body.pick;
    sess.pick = loc;
    console.log(sess.pick);
    console.log(req.body);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project");
        var query = { "loc": loc };
        dbo.collection("Bikes").find(query).toArray(function(err, results) {
            if (err) throw err;
            var bikes = results;
            console.log(bikes);
            db.close();
            res.render('bikes', { result: results });
        });
    });
});
app.get('/admin', function(req, res) {
    res.render('admin');
});
app.post('/adminUser', function(req, res) {
    var { radio, pass } = req.body;
    if (pass == "shiva") {
        if (radio == "User") {

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("Project");

                dbo.collection("Users").find().toArray(function(err, results) {
                    if (err) throw err;
                    var bikes = results;
                    console.log(bikes);
                    db.close();
                    res.render('adminUser', { result: results });
                });
            });
        }
    } else {
        res.redirect('admin')
    }
})
app.post('/admin', function(req, res) {
    var { radio, pass } = req.body;
    if (pass == "shiva") {
        if (radio == "User") {
            console.log("Users");
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("Project");

                dbo.collection("Users").find().toArray(function(err, results) {
                    if (err) throw err;
                    var bikes = results;
                    console.log(bikes);
                    db.close();
                    res.render('adminUser', { result: results });
                });
            });
        }
        if (radio == "Bikes") {
            console.log("Bikes");

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("Project");

                dbo.collection("Bikes").find().toArray(function(err, results) {
                    if (err) throw err;
                    var bikes = results;
                    console.log(bikes);
                    db.close();
                    res.render('adminbikes', { result: results });
                });
            });
        }
    } else {
        res.redirect('admin')
    }
})
app.post('/delete', function(req, res) {
    console.log(req.body.id);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project");
        var myquery = { random: req.body.id };
        dbo.collection("Bikes").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
        dbo.collection("Bikes").find().toArray(function(err, results) {
            if (err) throw err;
            var bikes = results;
            console.log(bikes);
            db.close();
            res.render('adminbikes', { result: results });
        });
    });
});
app.get("/profile", function(req, res) {
    sess = req.session;
    if (!sess.name) {
        res.redirect('/login');
    }
    var name = sess.name;
    var phone = sess.phone;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project");
        var q = { name: name, phone: phone }
        dbo.collection("Users").findOne(q, function(err, result) {
            if (err) throw err;
            db.close();
            res.render('profile', {
                sn,
                phone,
                email,
                result
            });
        });
    });
})
app.post('/edo', function(req, res) {
    console.log(req.body);
    sess = req.session;
    if (!sess.name) {
        res.redirect('/login');
    }
    var name = sess.name;
    var phone = sess.phone;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project");
        var q = { name: name, phone: phone }
        var newvalues = { $set: { name: "Mickey", address: "Canyon 123" } };
        dbo.collection("Users").updateOne(q, newvalues, function(err, result) {
            if (err) throw err;
            db.close();
            res.render('profile', {
                sn,
                phone,
                email,
                result
            });
        });
    });
})
app.listen(5000);
console.log("server started at port 5000")