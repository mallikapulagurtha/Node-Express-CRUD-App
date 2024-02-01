const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

// Image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

// Insert user into DB
router.post('/add', upload, async (req, resp) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });
    let new_user;
    try {
        new_user = await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        req.session.username = new_user.name
        console.log(req.session.message);
        console.log(req.session.username);
        await req.session.save()
        resp.redirect('/')
    } catch (saveError) {
        console.error('Error saving user:', saveError);
        return resp.status(500).json({ error: 'Error saving user' });
    }
});

router.get('/', async (req, resp) => {
    try {
        const users = await User.find({});
        resp.render('home', {
            title : "Home Page",
            users: users
        })
      } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

// router.get("/users", (req, resp) => {
//     resp.send("All Users");
// });
router.get("/add", (req, resp) => {
    resp.render('add-user', { title: "Add User" })
});

//get all users
router.get('/users', async (req, resp) => {
    try {
        const users = await User.find({});
        resp.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
