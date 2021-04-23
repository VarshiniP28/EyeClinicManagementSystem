const express = require("express");
const router = express.Router();

router.get("/",function(req,res){
    res.render("index");
});

router.get("/index",function(req,res){
    res.render("index");
});

router.get("/register",function(req,res){
    res.render("register");
});

router.get("/receptionistprofile",function(req,res){
    res.render("receptionistprofile");
});

router.get("/doctorprofile",function(req,res){
    res.render("doctorprofile");
});

router.get("/adminprofile",function(req,res){
    res.render("adminprofile");
});

router.get("/patient",function(req,res){
    res.render("patient");
});

router.get("/addpatient",function(req,res){
    res.render("addpatient");
});

router.get("/product",function(req,res){
    res.render("product");
});

router.get("/addproduct",function(req,res){
    res.render("addproduct");
});

router.get("/order",function(req,res){
    res.render("order");
});

router.get("/addorder",function(req,res){
    res.render("addorder");
});

router.get("/employee",function(req,res){
    res.render("employee");
});

router.get("/diagnosis",function(req,res){
    res.render("diagnosis");
});

router.get("/adddiagnosis",function(req,res){
    res.render("adddiagnosis");
});

router.get("/bill",function(req,res){
    res.render("bill");
});

router.get("/addbill",function(req,res){
    res.render("addbill");
});

router.get("/generatebill",function(req,res){
    res.render("generatebill");
});

router.get("/removeemployee",function(req,res){
    res.render("removeemployee");
});

router.get("/admin",function(req,res){
    res.render("admin");
});

router.get("/approveusers",function(req,res){
    res.render("approveusers");
});

router.get("/approve",function(req,res){
    res.render("approve");
});

router.get("/addappointment",function(req,res){
    res.render("addappointment");
});

router.get("/mlindex",function(req,res){
    res.render("mlindex");
});

router.get("/admindashboard",function(req,res){
    res.render("admindashboard");
});

router.get("/employeedashboard",function(req,res){
    res.render("employeedashboard");
});

router.get("/appointments",function(req,res){
    res.render("appointments");
});



module.exports = router;