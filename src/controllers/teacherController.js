const teacherModel = require('../models/teacherModel')
const studentModel = require('../models/studentModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ObjectId = require('mongoose').Types.ObjectId


//////////////////////////////////////////// Regex /////////////////////////////////////////////

const isValidName = function (body) {
    const nameRegex = /^[a-zA-Z_ ]*$/;
    return nameRegex.test(body);
};

const isValidEmail = function (body) {
    const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    return emailRegex.test(body);
};

const isValidPassword = function (body) {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
    return passwordRegex.test(body);
};

const isValidMark = function (body) {
    const nameRegex = /^[0-9]+$/;
    return nameRegex.test(body);
}

/////////////////////////////////////////// Api's /////////////////////////////////////////////////

const createTeacher = async function (req, res) {
    try {
        let data = req.body
        let { name, email, password, ...rest } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Pleas provide detail" })
        }
        if (Object.keys(rest).length != 0) {
            return res.status(400).send({ status: false, message: "Pleas provide required details only (name, email and password)" })
        }

        if (!name)
            return res.status(400).send({ status: false, message: "name is required" });
        if (!email)
            return res.status(400).send({ status: false, message: "email is required" });
        if (!password)
            return res.status(400).send({ status: false, message: "password is required" });

        if (!isValidName(name)) return res.status(400).send({ status: false, message: "Invalid name" });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Invalid email" });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });

        const isEmailAlreadyUsed = await teacherModel.findOne({ email: email });
        if (isEmailAlreadyUsed) return res.status(404).send({ status: false, message: "Email is already used" });

        // (password, 10) => 10 is calles salt round which actual mean is cost factor. The cost factor controls how much time is needed to calculate a single BCrypt hash.
        //                   In simple words we can say that the higher salt round means higher secured encrypted password.
        const encryptedPassword = await bcrypt.hash(password, 10);

        data.password = encryptedPassword

        const savedData = await teacherModel.create(data)
        return res.status(201).send({ status: true, msg: savedData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

///////////////////////////////////////// LogIn ////////////////////////////////////////////////////

const login = async function (req, res) {
    try {
        let credentials = req.body

        let { email, password, ...rest } = { ...credentials }

        if (Object.keys(rest).length != 0) {
            return res.status(400).send({ status: false, message: "Data must be email and password only." });
        }

        if (!email || !password) {
            return res.status(400).send({ status: false, message: "Email and Password Both are required..." });
        }

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Invalid email" });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });

        let user = await teacherModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, msg: "Incorrect emailId" });

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(400).send({ status: false, data: "Wrong Password" });
        }

        let token = jwt.sign(
            {
                userId: user._id.toString(),
            },
            "student_result",
            { expiresIn: "6h" }
        )
        let teacherId = user._id
        let loginData = { teacherId, token }

        return res.status(201).send({ status: true, message: "Success", data: loginData })
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

//////////////////////////////////////// FetchData /////////////////////////////////////////////////////////

const getStudent = async function (req, res) {
    try {
        let { name, subject, marks, marksGreaterThan, marksLessThan, ...rest } = req.query

        if (Object.keys(rest).length != 0) {
            return res.status(400).send({ status: false, message: "Filter data through keys => name, subject, marks, marksGreaterThan, marksLessThan" });
        }

        let userId = req.token.userId
        let data = { isDeleted: false }

        if (name) {
            if (!isValidName(name))
                return res.status(400).send({ status: false, message: "Invalid name" });
            const regexForName = new RegExp(name, "i");
            data.name = { $regex: regexForName };
        }
        if (subject) {
            if (!isValidName(subject))
                return res.status(400).send({ status: false, message: "Invalid subject" });
            data.subject = subject
        }
        if (marks) {
            if (!isValidMark(marks))
                return res.status(400).send({ status: false, message: "Invalid marks" });
            data.marks = marks
        }
        if (marksGreaterThan) {
            if (!isValidMark(marksGreaterThan)) {
                return res.status(400).send({ status: false, message: "Marks can only be integer" });
            }
            data.marks = { $gt: marksGreaterThan };
        }
        if (marksLessThan) {
            if (!isValidMark(marksLessThan)) {
                return res.status(400).send({ status: false, message: "Marks can only be integer" });
            }
            data.marks = { $lt: marksLessThan };
        }
        if (marksGreaterThan && marksLessThan) {
            data.marks = { $gt: marksGreaterThan, $lt: marksLessThan };
        }
        let allStudents = await studentModel.find({ $and: [data, { teacherId: userId }] });// isDelted : fales uper bhi likh sakte hain ya yahan bhi

        if (allStudents.length == 0) {
            return res.status(404).send({ status: false, message: "No student found" });
        }

        return res.status(200).send({ status: true, message: "Success", data: allStudents });

    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}

///////////////////////////////////////// Update StudentDetails ///////////////////////////////////////////////

const updateStudents = async function (req, res) {
    try {
        let studentDetail = req.body
        let { name, marks, ...rest } = studentDetail
        let studentId = req.params.studentId

        if (Object.keys(studentDetail).length == 0) {
            return res.status(400).send({ status: false, message: "Please provide details which you want to update" });
        }

        if (Object.keys(rest).length != 0) {
            return res.status(400).send({ status: false, message: "You can update only name and marks" });
        }

        if (!ObjectId.isValid(studentId)) return res.status(400).send({ status: false, message: "Invalid studentId" })

        if (name) {
            if (!isValidName(name)) return res.status(400).send({ status: false, message: "Invalid name" });
            let isStudentExist = await studentModel.find({ name: name })
            if (isStudentExist.length !== 0) return res.status(400).send({ status: false, message: "Name already exist." })
        }

        if (marks) {
            if (!isValidMark(marks)) return res.status(400).send({ status: false, message: "Invalid marks" });
        }

        let updateStudents = await studentModel.findOneAndUpdate(
            { _id: studentId, isDeleted: false },
            { $set: { name: name, marks: marks } }, { new: true }
        )

        return res.status(200).send({ status: false, message: updateStudents })

    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}

//////////////////////////////////////// deleteStudent ////////////////////////////////////////////////

const deleteStudents = async function (req, res) {
    try {
        let studentId = req.params.studentId

        if (!ObjectId.isValid(studentId)) return res.status(400).send({ status: false, msg: "Invalid studentId" })

        let deleteStudent = await studentModel.findOneAndUpdate({ _id: studentId, isDeleted: false }, { $set: { isDeleted: true } }, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: "Student deleted Successfully!" });
    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}


module.exports = { createTeacher, login, getStudent, updateStudents, deleteStudents }