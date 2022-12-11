const jwt = require('jsonwebtoken')
const ObjectId = require('mongoose').Types.ObjectId
const studentModel = require('../models/studentModel')

//////////////////////////////////////////////////// Authentication //////////////////////////////////////////////////////

const authentication = async (req, res, next) => {
    try {
        let token = req.headers['x-api-key']
        if (!token) return res.status(402).send({ status: false, msg: "token must be present" })

        let validateToken = jwt.verify(token, "student_result")
        if (!validateToken) return res.status(402).send({ status: false, msg: "invalid token" })

        req.validateToken = validateToken

        next()
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//////////////////////////////////////////////////// Authorisation ///////////////////////////////////////////////////////

const authorisation = async (req, res, next) => {

    try {
        let loggedInUser = req.validateToken.userId

        let studentId = req.params.studentId
        if (!ObjectId.isValid(studentId)) return res.status(400).send({ status: false, msg: "Invalid studentId" })

        let student = await studentModel.findById(studentId)
        if (!student) return res.status(404).send({ status: false, msg: "student does not exist" })
        if (student.isDeleted == true) return res.status(400).send({ status: false, msg: "student doesn't exist" })

        if (loggedInUser != student.teacherId) return res.status(403).send({ status: false, msg: "User is not authorised" })

        next()
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

module.exports = { authentication, authorisation }