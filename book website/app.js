const express = require("express");
const req = require("express/lib/request");
const app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended:true}))

const md5 = require("md5");

app.set('view engine','ejs');
app.use(express.static("public"))

const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/bookDB")

const userSchema = new mongoose.Schema ({
    username:String,
    email:String,
    password:String
})
const User = mongoose.model('User',userSchema)

const bookSchema = new mongoose.Schema ({
    username: String,
    name:String,
    details:String
})

let currentUserName=""

const Book = mongoose.model('Book',bookSchema)

app.get("/",(req,res)=>{
    res.redirect('/login')
  })
  
app.get("/register",(req,res)=>{
    res.render('register')
})
  
app.get("/login",(req,res)=>{
    res.render('login')
})


app.post('/register',(req,res)=>{
    const username = req.body.username
    const email = req.body.email
    const password = md5(req.body.password)

    let user = new User ({
        username:username,
        email:email,
        password:password
    })
    user.save()
    res.redirect('/login')
    
})

app.post('/login',(req,res)=>{
    const email = req.body.email
    const password = md5(req.body.password)

    User.findOne({email:email},(err,user)=>{
        if(err){
            console.log(err)
        }else{
            if(user){
                if(password === user.password){
                    currentUserName=user.username
                    Book.find({username:currentUserName},(err,books)=>{
                        if(err){
                            console.log(err)
                        }else{
                            console.log(books)
                            if(books){
                                res.render('books',{books:books, username:currentUserName})
                            }
                        }
                    })
                }
            }

        }
    })
    
})

app.post('/books',(req,res)=>{
    const add = req.body.add
    const edit = req.body.edit
    const del = req.body.delete

    console.log(add)



    if(add){
        newBook = {
            username: currentUserName,
            name:"",
            details:""
        }
        res.render("books_add",{bookdet:newBook})
    }else if(edit){
        console.log('edit')
        console.log(edit)
        Book.findOne({_id:edit},(err,book)=>{
            if(err){
                console.log(err)
            }else{
                console.log(book)
                if(book){
                  
                    newBook = {
                        username: currentUserName,
                        name:book.name,
                        details:book.details
                    }
                    res.render("books_add",{bookdet:newBook})

                    Book.deleteOne({name:book.name},(err)=>{
                        console.log(err)
                    })
                }
            }
        })


    }else if(del){
        console.log('del')
        Book.findOne({_id:del},(err,book)=>{
            if(err){
                console.log(err)
            }else{
                if(book){
                    Book.deleteOne({name:book.name},(err)=>{
                        if(err){
                            console.log(err)
                        }else{
                            Book.find({username:currentUserName},(err,books)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    console.log(books)
                                    if(books){
                                        res.render('books',{books:books, username:currentUserName})
                                    }
                                }
                            })
                        }
                    })

                }
            }
        })

    }


})

app.post('/books_add',(req,res)=>{
    const name = req.body.name
    const details = req.body.details
    const username = currentUserName

    let book = new Book ({
        username:username,
        name:name,
        details:details
    })
    book.save((err)=>{
        if(err){
            console.log(err)
        }else{
            Book.find({username:currentUserName},(err,books)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log(books)
                    if(books){
                        res.render('books',{books:books, username:currentUserName})
                    }
                }
            })

        }
    });



    
});



app.get('/books',(req,res)=>{
    res.redirect('/login')
})
app.get('/books_add',(req,res)=>{
    res.redirect('/login')
})





app.listen(3000,()=>{
    console.log("Server started at node 3000")
  })
  