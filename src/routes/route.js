const express = require('express');
const router = express.Router();

const { createStudent } = require('../controllers/studentController')
const { createTeacher, login, getStudent, updateStudents, deleteStudents } = require('../controllers/teacherController')
const { authentication, authorisation } = require('../middlewares/middleware')

router.post("/student", authentication, createStudent)

router.post("/register", createTeacher)
router.post("/login", login)
router.get("/student", authentication, getStudent)
router.put("/update/:studentId", authentication, authorisation, updateStudents)
router.delete("/delete/:studentId", authentication, authorisation, deleteStudents)


module.exports = router