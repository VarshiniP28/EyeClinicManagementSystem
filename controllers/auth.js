const mysql =require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
var nodemailer = require('nodemailer');

//function to login user
exports.index = async function(req,res){
    try
    {
        const {email,password}=req.body;
        if(!email || !password )
        {
            return res.status(400).render('index',{
                message: 'Please provide an email and password'
            })
        }

        db.query('SELECT * FROM Approval WHERE Email = ?',[email],async function(error,results){
            console.log(results);
            if(results[0])
            {
                res.status(401).render("index",{
                    message: 'Your account is yet to be approved. Please try again later.'
                })
            }
        });

        //Nodemailer
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'varshup28@gmail.com',
              pass: 'atlanta28$'
            }
          });
          
          var mailOptions = {
            from: 'varshup28@gmail.com',
            to: 'varshinip.is18@rvce.edu.in',
            subject: 'Login initiated',
            text: 'You have logged into icare system. If this was not your action, please contact the administrator immediately.'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          //nodemailer ends 


        db.query('SELECT * FROM Login WHERE Email = ?',[email],async function(error,results){
            console.log(results);
            if(!results || !(await bcrypt.compare(password,results[0].Password)))
            {
                res.status(401).render("index",{
                    message: 'Email or password is incorrect'
                })
            }
            else
            {
                const redir = results[0].Role;
                if(redir=='Admin')
                {
                    res.status(200).redirect("/admindashboard");
                }
                else
                {
                    res.status(200).redirect("/employeedashboard");
                }
            }

        });
    } 
    catch(error)
    {
        console.log(error);
    }
}

//function to register user
exports.register = function(req,res){
    console.log(req.body);
    const {firstname,lastname,gender,email,password,contactno,qualifications,role} = req.body;

    if(!firstname || !lastname || !gender || !email || !password || !contactno || !qualifications || !role)
    {
        return res.status(400).render('register',{message: 'Please enter all the details.'});
    }

    
    db.query('SELECT Email FROM Login WHERE Email = ?',[email],async function(error,results){
        if(error)
        {
            console.log(error);
        }
        if(results.length>0)
        {
            return res.render('register',{
                message: 'That email is already in use' 
            });
        }   
        
        let hashedPassword = await bcrypt.hash(password,8);
        console.log(hashedPassword);

        db.query('INSERT INTO Approval SET ?',{First_Name: firstname,Last_Name: lastname,Gender: gender,Email: email,Password: hashedPassword,Contact_No: contactno,Qualifications: qualifications, Role: role},function(error,results){
            if(error)
            {
                console.log(error);
            }
            return res.render('register',{message: 'User Registered! You will be able to login after the admin approves your registration.'});
        });
    });    
}

//function to approve users
exports.approve = function(req,res){
    console.log(req.body);
    const {approvalid} = req.body;

    if(!approvalid)
        return res.render('approve',{message:'Results not found'});

    db.query('SELECT * FROM Approval WHERE Approval_ID=?',[approvalid],function(error,results){
        if(error)
            console.log(error);
        
        var firstname = results[0].First_Name;
        var lastname = results[0].Last_Name;
        var gender = results[0].Gender;
        var email = results[0].Email;
        var password = results[0].Password;
        var contactno = results[0].Contact_No;
        var qualifications = results[0].Qualifications;
        var role = results[0].Role;

        db.query('INSERT INTO Login SET ?',{First_Name: firstname,Last_Name: lastname,Gender: gender,Email: email,Password: password,Contact_No: contactno,Qualifications: qualifications, Role: role},function(error,results){
            if(error)
            {
                console.log(error);
            }
            else
            {
                console.log(results);
                if(role=='Admin') //Inserting data into Admin
                {
                    db.query('INSERT INTO Admin SET ?',{First_Name: firstname,Last_Name: lastname,Email_ID: email,Contact_No: contactno},function(error,results){
                        if(error)
                        {
                            console.log(error);
                        }
                        else
                        {
                            console.log(results);
                        }
                    }); 
                }
                else //Inserting data into Employee
                {
                    db.query('INSERT INTO Employee SET ?',{First_Name: firstname,Last_Name: lastname,Email_ID: email,Contact_No: contactno,Qualifications: qualifications,Role: role,Gender: gender},function(error,results){
                        if(error)
                        {
                            console.log(error);
                        }
                        else
                        {
                            console.log(results);
                        }
                    }); 
                }
                    res.render('approve',{message: 'User Approved!' 
                });
            }
        });

        db.query('DELETE FROM Approval WHERE Approval_ID=?',[approvalid],function(error,results){
            if(error)
                console.log(error);            
        });
        
    });
  
}


//function to register patient
exports.addpatient = function(req,res){
    console.log(req.body);
    const {firstname,lastname,dob,gender,contactno,reasonofvisit,appointment} = req.body;

    if(!firstname || !lastname || !dob || !gender ||!contactno || !reasonofvisit || !appointment )
    {
        return res.status(400).render('addpatient',{message: 'Please provide all the details'});
    }

    db.query('INSERT INTO Patient SET ?',{First_Name: firstname,Last_Name: lastname,Gender: gender,Contact_No: contactno,DOB: dob,Reason_of_visit: reasonofvisit,Appointment: appointment},function(error,results){
        if(error)
        {
            console.log(error);
        }
        else
        {
            console.log(results);           
                
            return res.render('addpatient',{
                message: 'Patient Registered!' 
            }); 
        }
    }); 
}  

//function to add appointment
exports.addappointment = function(req,res){
    console.log(req.body);
    const {patientid,appointment} = req.body;

    if(!patientid || !appointment )
    {
        return res.status(400).render('addappointment',{message: 'Please provide all the details'});
    }

    db.query('UPDATE Patient SET Appointment=? WHERE Patient_ID=?',[appointment,patientid],function(error,results){
        if(error)
        {
            console.log(error);
        }
        else
        {
            console.log(results);           
                
            return res.render('addappointment',{message: 'Appointment booked!'}); 
        }
    }); 
}

//function to add product
exports.addproduct = function(req,res){
    console.log(req.body);
    const {name,description,price,productimage,stock} = req.body;
    var file = req.files.productimage;
    var filename = file.name;
    console.log("Product name is - "+filename);

    if(!name || !description || !price )
    {
        return res.status(400).render('addproduct',{message: 'Please provide all the details'});
    }

    file.mv('public/images/product_images/'+file.name, function(err) 
        {                       
            if (err)
                return res.status(500).send(err);

            db.query('INSERT INTO Product SET ?',{Name: name,Description: description,Price: price,Product_image: filename,Stock: stock},function(error,results){
                if(error)
                {
                    console.log(error);
                }
                else
                {
                    console.log(results);           
                        
                    return res.render('addproduct',{
                        message: 'Product Registered!' 
                    }); 
                }
        }); 
    });
}

//function to add diagnosis
exports.adddiagnosis = function(req,res){
    console.log(req.body);
    const {firstname,info,consultationfee} = req.body;

    var arr = firstname.split(" ");

    if(!firstname || !info || !consultationfee)
    {
        return res.status(400).render('addpatient',{message: 'Please provide all the details'});
    }

    db.query('SELECT Patient_ID FROM Patient WHERE First_Name=? AND Last_Name=?',[arr[0],arr[1]],function(error,results){
        if(error)
        {
            console.log(error);
        }
        else
        {
            const id=results[0].Patient_ID;
            db.query('INSERT INTO Diagnosis SET ?',{Patients_ID: id,Info: info, Consultation_Fee: consultationfee},function(error,results){
                if(error)
                {
                    console.log(error);
                }
                else
                {
                    console.log(results);           
                        
                    return res.render('adddiagnosis',{
                        message: 'Diagnosis Entered!' 
                    }); 
                }
            });
        }
    });     
}  

//function for search patient
exports.searchpatient = function(req,res){
    console.log(req.body);
    const {searchname,searchcontactno} = req.body;

    if(!searchname && !searchcontactno )
    {
        return res.status(400).render('searchpatient',{message: 'Patient not found'});
    }

    var c=0;
    if(searchname)
        c=1;
    if(searchcontactno)
        c=2;
    if(searchname && searchcontactno)
        c=3;

    if(c==1)
    {
        db.query('SELECT * FROM Patient WHERE First_Name=?',[searchname],function(error,data,fields){
            if(error)
                console.log(error);
            if(data===null)
            {
                return res.render('searchpatient',{message: "Patient not found"});
            }
            res.render('searchpatient', { title: 'Patient Detail', data: data});
        });
    }
    else if(c==2)
    {
        db.query('SELECT * FROM Patient WHERE Contact_No=?',[searchcontactno],function(error,data,fields){
            if(error)
                console.log(error);

                if(!data)
                {
                    return res.render('searchpatient',{message: "Patient not found"});
                }

            res.render('searchpatient', { title: 'Patient Detail', data: data});
        });
    }
    else if(c==3)
    {
        db.query('SELECT * FROM Patient WHERE Contact_No=? AND First_Name=?',[searchcontactno,searchname],function(error,data,fileds){
            if(error)
                console.log(error);

                if(!data)
                {
                    return res.render('searchpatient',{message: "Patient not found"});
                }
            res.render('searchpatient', { title: 'Patient Detail', data: data});
        });
    }  
    else
    {
        return res.render('searchpatient',{message: 'Patient not found'});
    }    
} 

//function to search for employee
exports.searchemployee = function(req,res){
    console.log(req.body);
    const {searchid,searchrole} = req.body;

    if(!searchid && !searchrole )
    {
        return res.status(400).render('searchemployee',{message: 'Employee not found'});
    }

    var c=0;
    if(searchid)
        c=1;
    if(searchrole)
        c=2;
    if(searchid && searchrole)
        c=3;

    if(c==1)
    {
        db.query('SELECT * FROM Employee WHERE Employee_ID=?',[searchid],function(error,data,fields){
            if(error)
                console.log(error);
            res.render('searchemployee', { title: 'Employee Detail', data: data});
        });
    }
    else if(c==2)
    {
        db.query('SELECT * FROM Employee WHERE Role=?',[searchrole],function(error,data,fields){
            if(error)
                console.log(error);
            res.render('searchemployee', { title: 'Employee Detail', data: data});
        });
    }
    else
    {
        db.query('SELECT * FROM Employee WHERE Role=? AND Employee_ID=?',[searchrole,searchid],function(error,data,fileds){
            if(error)
                console.log(error);
            res.render('searchemployee', { title: 'Employee Detail', data: data});
        });
    }      
} 

//function to search for employee
exports.searchproduct = function(req,res){
    console.log(req.body);
    const {searchid,searchname} = req.body;

    if(!searchid && !searchname )
    {
        return res.status(400).render('searchproduct',{message: 'Product not found'});
    }

    var c=0;
    if(searchid)
        c=1;
    if(searchname)
        c=2;
    if(searchid && searchname)
        c=3;

    if(c==1)
    {
        db.query('SELECT * FROM Product WHERE Product_ID=?',[searchid],function(error,data,fields){
            if(error)
                console.log(error);
            res.render('searchproduct', { title: 'Product Detail', data: data});
        });
    }
    else if(c==2)
    {
        db.query('SELECT * FROM Product WHERE Name=?',[searchname],function(error,data,fields){
            if(error)
                console.log(error);
            res.render('searchproduct', { title: 'Product Detail', data: data});
        });
    }
    else
    {
        db.query('SELECT * FROM Product WHERE Product_ID=? AND Name=?',[searchid,searchname],function(error,data,fileds){
            if(error)
                console.log(error);
            res.render('searchproduct', { title: 'Product Detail', data: data});
        });
    }      
} 

//function to search for orders
exports.searchorder = function(req,res){
    console.log(req.body);
    const {searchid} = req.body;

    if(!searchid )
    {
        return res.status(400).render('searchorder',{message: 'Order not found'});
    }

    db.query('SELECT * FROM Orders WHERE Order_ID=?',[searchid],function(error,data,fields){
        if(error)
            console.log(error);
        res.render('searchorder', { title: 'Order Detail', data: data});
    });   
} 

//function to search for diagnosis
exports.searchdiagnosis = function(req,res){
    console.log(req.body);
    const {patientid} = req.body;

    if(!patientid)
    {
        return res.status(400).render('searchdiagnosis',{message: 'Diagnosis not found'});
    }

    db.query('SELECT * FROM Diagnosis WHERE Patients_ID=?',[patientid],function(error,data,fields){
        if(error)
            console.log(error);
        res.render('searchdiagnosis', { title: '-', data: data});
    });   
} 

//function to add order
exports.addorder = function(req,res){
    console.log(req.body);
    const {productid,patientid,date} = req.body;

    if(!productid || !patientid || !date )
    {
        return res.status(400).render('addorder',{message: 'Please provide all the details'});
    }

    db.query('SELECT * FROM Product WHERE Product_ID=?',[productid],function(error,results){
        if(error)
            console.log(error);
        var price = results[0].Price;
        var stock = results[0].Stock;
        stock--;

        db.query('UPDATE Product SET Stock=? WHERE Product_ID=?',[stock,productid],function(error,results){
            if(error)
            {
                console.log(error);
            }
        });
        
        db.query('INSERT INTO Orders Set ?',{Product_ID: productid,Patient_ID: patientid, Date_of_order: date,Price: price},function(error,results){
            if(error)
                console.log(error);
            console.log(results);
            res.render('addorder',{message: 'Order Placed!'});
        });
    });
}

//function to search bill
exports.searchbill = function(req,res){
    console.log(req.body);
    const {patientid} = req.body;

    if(!patientid)
    {
        return res.status(400).render('searchbill',{message: 'Bill not found'});
    }

    db.query('SELECT * FROM Bill WHERE Patientss_ID=?',[patientid],function(error,data,fields){
        if(error)
            console.log(error);
        res.render('searchbill', { title: '-', data: data});
    });   
}

//function to generate bill
exports.generatebill = function(req,res){
    console.log(req.body);
    const {generateid} = req.body;

    if(!generateid)
    {
        return res.status(400).render('generatebill',{message: 'Please provide Patient ID to generate bill.'});
    }

    var fn = '';
    var ln = '';
    var contactno = '';
    var patient_name = '';

    db.query('SELECT * FROM Patient WHERE Patient_ID=?',[generateid],function(error,results){
        if(error)
            console.log(error);
        else
        {
            fn = results[0].First_Name;
            ln = results[0].Last_Name;
            patient_name = fn+' '+ln;
            contactno = results[0].Contact_No;
        }

    });

    db.query('SELECT * FROM Orders WHERE Patient_ID=?',[generateid],function(error,results){
        if(error)
            console.log(error);
        else
        {
            var totalproductfee = 0;
            
            var date = results[0].Date_of_order;
            for(var i=0;i<results.length;i++)
                totalproductfee+=results[i].Price;
            
            db.query('SELECT * FROM Diagnosis WHERE Patients_ID=?',[generateid],function(error,results){
                if(error)
                    console.log(error);
                else
                {
                    var confee = results[0].Consultation_Fee;
                    var info = results[0].Info;
                    var totalfee = totalproductfee+results[0].Consultation_Fee;
                    db.query('INSERT INTO Bill SET?',{Date: date,Patientss_ID: generateid,Consultation_Fee: confee, Product_Fee: totalproductfee,Total_Fee: totalfee,Info: info,Patient_Name: patient_name,Contact_No: contactno},function(error,results){
                        if(error)
                            console.log(error);
                        else
                        {
                            db.query('SELECT * FROM Bill WHERE Patientss_ID=?',[generateid],function(error,data,fields){
                                if(error)
                                    console.log(error);
                                res.render('generatebill', { title: '-', data: data});
                            });
                        }
                    });
                }
            });
        }
    });
}

exports.removeemployee = function(req,res){
    console.log(req.body); 
    const {employeeid} = req.body;

    if(!employeeid)
    {
        return res.status(400).render('removeemployee',{message: 'Employee not found'});
    }
    var email;
    db.query('SELECT * FROM Employee WHERE Employee_ID=?',[employeeid],function(error,results){
        if(error)
            console.log(error)
        email = results[0].Email_ID;
    });
    db.query('DELETE FROM Employee WHERE Employee_ID=?',[employeeid],function(error,results){
        if(error)
            console.log(error);
        
        
        db.query('DELETE FROM Login WHERE Email=?',[email],function(error,results){
            if(error)
                console.log(error);
        });
        
        return res.render('removeemployee',{message: 'Employee removed.'});
        
    });
}


//function for search admin
exports.searchadmin = function(req,res){
    console.log(req.body);
    const {searchname,searchcontactno} = req.body;

    if(!searchname && !searchcontactno )
    {
        return res.status(400).render('searchadmin',{message: 'Admin not found'});
    }

    var c=0;
    if(searchname)
        c=1;
    if(searchcontactno)
        c=2;
    if(searchname && searchcontactno)
        c=3;

    if(c==1)
    {
        db.query('SELECT * FROM Admin WHERE First_Name=?',[searchname],function(error,data,fields){
            if(error)
                console.log(error);
            if(data===null)
            {
                return res.render('searchadmin',{message: "Admin not found"});
            }
            res.render('searchadmin', { title: 'Admin Detail', data: data});
        });
    }
    else if(c==2)
    {
        db.query('SELECT * FROM Admin WHERE Contact_No=?',[searchcontactno],function(error,data,fields){
            if(error)
                console.log(error);

                if(!data)
                {
                    return res.render('searchadmin',{message: "Admin not found"});
                }

            res.render('searchadmin', { title: 'Admin Detail', data: data});
        });
    }
    else if(c==3)
    {
        db.query('SELECT * FROM Admin WHERE Contact_No=? AND First_Name=?',[searchcontactno,searchname],function(error,data,fileds){
            if(error)
                console.log(error);

                if(!data)
                {
                    return res.render('searchadmin',{message: "Admin not found"});
                }
            res.render('searchadmin', { title: 'Admin Detail', data: data});
        });
    }  
    else
    {
        return res.render('searchadmin',{message: 'Admin not found'});
    }    
} 


//function to view appointments
exports.appointments = function(req,res){
    console.log(req.body);
    const {date1,date2} = req.body;

    db.query('SELECT * FROM Patient WHERE Appointment BETWEEN ? AND ?',[date1,date2],function(error,data,fields){
        if(error)
            console.log(error);
        else
        {
            res.render('viewappointments', { title: '', data: data});
        }
    });    
}