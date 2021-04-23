const express = require("express");
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/index',authController.index);
router.post('/register',authController.register);

//router.post('/adminprofile',authController.adminprofile)

router.post('/addpatient',authController.addpatient);
router.post('/addproduct',authController.addproduct);
router.post('/adddiagnosis',authController.adddiagnosis);
router.post('/addorder',authController.addorder);
router.post('/approve',authController.approve);
router.post('/addappointment',authController.addappointment);
//router.post('/admindashboard',authController.admindashboard);


router.post('/removeemployee',authController.removeemployee);

router.post('/searchpatient',authController.searchpatient);
router.post('/searchemployee',authController.searchemployee);
router.post('/searchproduct',authController.searchproduct);
router.post('/searchorder',authController.searchorder);
router.post('/searchdiagnosis',authController.searchdiagnosis);
router.post('/searchbill',authController.searchbill);
router.post('/searchadmin',authController.searchadmin);


router.post('/generatebill',authController.generatebill);
router.post('/appointments',authController.appointments);

module.exports = router;