const studentModel = require('../models/studentModel')
const teacherModel = require('../models/teacherModel')
const ObjectId = require('mongoose').Types.ObjectId


//////////////////////////////////////////// Regex /////////////////////////////////////////////

const isValidName = function (body) {
    const nameRegex = /^[a-zA-Z_ ]*$/;
    return nameRegex.test(body);
};

const isValidMark = function (body) {
    const nameRegex = /^[0-9]+$/;
    return nameRegex.test(body);
};

/////////////////////////////////////////// Api's /////////////////////////////////////////////////

const createStudent = async function (req, res) {
    try {
        let data = req.body
        let { name, teacherId, subject, marks, ...rest } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Pleas provide detail" })
        }
        if (Object.keys(rest).length != 0) {
            return res.status(400).send({ status: false, message: "Pleas provide required details only (name, teacherId, subject and marks)" })
        }

        if (!teacherId)
        return res.status(400).send({ status: false, message: "teacherId is required" });
        if (!ObjectId.isValid(teacherId)) return res.status(400).send({ status: false, msg: "Invalid teacherId" })

        if (req.token.userId != teacherId)
            return res.status(403).send({ status: false, message: "unauthorized" });

        if (!name)
            return res.status(400).send({ status: false, message: "name is required" });
        if (!subject)
            return res.status(400).send({ status: false, message: "subject is required" });
        if (!marks)
            return res.status(400).send({ status: false, message: "marks is required" });

        if (!isValidName(name)) return res.status(400).send({ status: false, message: "Invalid name" });
        if (!isValidName(subject)) return res.status(400).send({ status: false, message: "Invalid subject" });
        if (!isValidMark(marks)) return res.status(400).send({ status: false, message: "Invalid marks" });

        if (!["Math", "English", "Hindi", "Science"].includes(subject)) {
            return res.status(400).send({ status: false, msg: "Subjects can only be Math, English, Hindi and Science" })
        }

        const validateTeacherId = await teacherModel.findById(teacherId)
        if (!validateTeacherId) return res.status(400).send({ status: false, msg: "teacher not found" })

        const isStudentExist = await studentModel.findOneAndUpdate({ name: name, teacherId: teacherId, subject: subject }, { $inc: { marks: marks } }, { new: true })

        if (isStudentExist) {
            return res.status(201).send({ status: true, message: isStudentExist })
        }

        const studentExist = await studentModel.findOne({ name: name, subject: subject })

        if (studentExist) {
            return res.status(400).send({ status: false, message: "This student doesn't belongs to you" })
        }

        const savedData = await studentModel.create(data)
        return res.status(201).send({ status: true, msg: savedData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createStudent }