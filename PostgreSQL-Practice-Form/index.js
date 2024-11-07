const express = require("express");
const pg = require("pg");
const app = express();
const methodOverride = require('method-override')

app.set("view engine","ejs");

const path = require("path");
app.set("views",path.join(__dirname,"/views"));

app.use(express.static(path.join(__dirname,"public")));

app.use(express.urlencoded({extended:true}));

app.use(methodOverride('_method'));

app.use(express.json());

let port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Form",
    password: "IGGalaxy",
    port: 5432,
  });
  
db.connect(); 

app.listen(port,()=>{
    console.log("server online");
})

app.get("/",(req,res)=>{
    res.render("home.ejs");
})

app.post("/",(req,res)=>{
    db.query("insert into credentials(fname,mname,lname,city,password,email) values($1,$2,$3,$4,$5,$6)",
        [req.body.fname,req.body.mname,req.body.lname,req.body.city,req.body.pass,req.body.email]);
    res.redirect("/");
})

app.delete("/",(req,res)=>{
    const word = req.body.user.split(' ');
    const parseed = req.body.password;
    if(word.length==1){
        db.query("select * from credentials where email=$1",
            [req.body.user],(err,res)=>{
                if(err){
                    console.error(err.stack);
                }
                else{
                    console.log(res.rows);
                    check(res.rows,parseed);
                }
            }
        );
    }
    else if(word.length==2){
        db.query("select * from credentials where fname=$1 and lname=$2",
            [word[0],word[1]],(err,res)=>{
                if(err){
                    console.error(err.stack);
                }
                else{
                    console.log(res.rows);
                    check(res.rows,parseed);
                }
            }
        );
    }

    else if (word.length == 3) {
        db.query(
            "SELECT * FROM credentials WHERE (fname = $1 AND lname = $2) AND (mname = $3)",
            [word[0], word[2], word[1]], // Ensure all three elements are in the array
            (err, res) => {
                if (err) {
                    console.error(err.stack);
                } else {
                    console.log(res.rows);
                    check(res.rows,parseed);
                }
            }
        );
    }

    else if (word.length > 3) {
        let str = "";
        console.log(word);
        for(let i=1;i<=word.length-2;i++){
            if(i==word.length-2){
                str=str+word[i];
            }
            else{
            str = str+word[i]+" ";}            
        }
        str.trim();
        console.log(word[0], str, word[word.length-1]);
        db.query(
            "SELECT * FROM credentials WHERE (fname = $1 AND lname = $2) AND (mname = $3)",
            [word[0], word[word.length-1], str], // Ensure all three elements are in the array
            (err, res) => {
                if (err) {
                    console.error(err.stack);
                } else {
                    console.log(res.rows);
                    check(res.rows,parseed);
                }
            }
        );
    }
    res.redirect("/");
})

function check(arr,str){
    if(arr.length==0){
        alert("User not found");
    }
    else{
        if(str==arr[0].password){
            db.query("delete from credentials where id=$1",[arr[0].id]);
        }
        else{
            alert("Wrong password");
        }
    }
}
