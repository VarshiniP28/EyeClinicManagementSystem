const express = require("express");
const app = express();
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const fileUpload = require('express-fileupload');
dotenv.config({path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE 
});

const publicDirectory = path.join(__dirname,'./public'); 
app.use(express.static(publicDirectory));
app.set('view engine','hbs');
app.use(fileUpload());

db.connect(function(error){
    if(error)
    {
        console.log(error);
    }
    else
    {
        console.log("MYSQL connected!!!!");
    }
});

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: false}));

//Parse JSON bodies(as sent by API clients)
app.use(express.json()); 



//Admin table
app.get('/admin', function(req, res, next) {
  db.query('SELECT * FROM Admin', function (err, data, fields) {
  if (err) throw err;
  res.render('admin', { title: 'Admin Details', data: data});
});
});


//Approval request table
app.get('/approveusers', function(req, res, next) {
  db.query('SELECT * FROM Approval', function (err, data, fields) {
  if (err) throw err;
  res.render('approveusers', { title: 'Approve Request Details', data: data});
});
});

//Dynamic dropdown table for Approval ID
app.get('/approve', function(req, res, next) {
  db.query('SELECT Approval_ID FROM Approval', function (err, data, fields) {
  if (err) throw err;
  res.render('approve', { title: 'Approve Request Details', data: data});
});
});

//Dynamic dropdown table for Employee ID
app.get('/removeemployee', function(req, res, next) {
  db.query('SELECT Employee_ID FROM Employee', function (err, data, fields) {
  if (err) throw err;
  res.render('removeemployee', { title: '', data: data});
});
});

//Dynamic dropdown table for Patient ID
app.get('/addappointment', function(req, res, next) {
  db.query('SELECT Patient_ID FROM Patient', function (err, data, fields) {
  if (err) throw err;
  res.render('addappointment', { title: '', data: data});
});
});

//Patient table
app.get('/patient', function(req, res, next) {
    db.query('SELECT * FROM Patient', function (err, data, fields) {
    if (err) throw err;
    res.render('patient', { title: 'Patient Details', data: data});
  });
});


//Product table
app.get('/product', function(req, res, next) {
    db.query('SELECT * FROM Product', function (err, data, fields) {
    if (err) throw err;
    res.render('product', { title: 'Product Details', data: data});
  });
});


//Product inventory table
app.get('/productinventory', function(req, res, next) {
  db.query('SELECT * FROM Product', function (err, data, fields) {
  if (err) throw err;
  res.render('productinventory', { title: 'Product Details', data: data});
});
});


//Employee table
app.get('/employee', function(req, res, next) {
    db.query('SELECT * FROM Employee', function (err, data, fields) {
    if (err) throw err;
    res.render('employee', { title: 'Employee Details', data: data});
  });
});


//Dynamic dropdown menu for diagnosis page
app.get('/adddiagnosis', function(req, res, next) {
    db.query('SELECT First_Name,Last_Name FROM Patient', function (err, data, fields) {
    if (err) throw err;
    res.render('adddiagnosis', { title: 'Patient Details', data: data});
  });
});

//Dynamic drop down menu for addorder page
app.get('/addorder', function(req, res, next) {
  db.query('SELECT Product_ID,Name FROM Product', function (err, data, fields) {
    if (err) throw err;
    res.render('addorder', { title: '-', data: data});
  });  
});


//Diagnosis table
app.get('/diagnosis', function(req, res, next) {
  db.query('SELECT * FROM Diagnosis', function (err, data, fields) {
    if (err) throw err;
    res.render('diagnosis', { title: '-', data: data});
  });  
});


//Order table
app.get('/order', function(req, res, next) {
  db.query('SELECT * FROM Orders', function (err, data, fields) {
  if (err) throw err;
  res.render('order', { title: 'Order Details', data: data});
});
});

//Bill table
app.get('/bill', function(req, res, next) {
  db.query('SELECT * FROM Bill', function (err, data, fields) {
  if (err) throw err;
  res.render('bill', { title: 'Bill Details', data: data});
});
});

//Defining routes
app.use('/',require("./routes/pages"));
app.use('/auth',require('./routes/auth'));


app.listen(7003,function(){
    console.log("Server started on port 7003");
});