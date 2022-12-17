const JWT = require('jsonwebtoken')
const AuthorModel = require("../models/authorModel")



//**     /////////////////////////      CreateAuthor      //////////////////////       **//

const createAuthor = async (req, res) => {
    try {

        let author = req.body;
        let{fname, lname, title, email, password } = req.body

        if (Object.keys(author).length == 0) return res.status(400).send({ status: false, msg: "please provide details"})

        if (!fname) return res.status(400).send({ status: false, msg: "First name is required" });
        if (!lname) return res.status(400).send({ status: false, msg: "Last name is required" });
        if (!title) return res.status(400).send({ status: false, msg: "Title is required" });
        if (!['Mr', 'Miss', 'Mrs'].includes(title)) return res.status(400).send({ status: false, msg: "Please provide title between [Mr / Miss / Mrs]" })
        if (!email) return res.status(400).send({ status: false, msg: "Email is required" });
        if (!password) return res.status(400).send({ status: false, msg: "Password is required" });

        const validateFName = (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(fname));
        const validateLName = (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(lname));
        const validateEmail = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
        const validatePassword = (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(password))

        if (!validateFName) return res.status(400).send({ status: false, msg: "First Name is invalid, Please check your First Name" });
        if (!validateLName) return res.status(400).send({ status: false, msg: "Last Name is invalid, Please check your Last Name" });
        if (!validateEmail) return res.status(400).send({ status: false, msg: "Email is invalid, Please check your Email address" });
        if (!validatePassword) return res.status(400).send({ status: false, msg: "use a strong password with at least => 1 lowercase alphabetical character => 1 uppercase alphabetical character => 1 numeric character => one special character and password must be eight characters or longer)" });

        let authorCreated = await AuthorModel.create(author);
        res.status(201).send({ status: true, data: authorCreated });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}


//**     /////////////////////////      Login author      //////////////////////       **//

const login = async (req, res) => {

    try {
        // taking EmailId and Password from body and checking both are present
        let credentials = req.body
        let { email, password } = credentials
        
        if (!email || !password) return res.status(404).send({ status: false, msg: "please enter EmailId and Password" })
        // if (!email) return res.status(404).send({ status: false, msg: "please enter EmailId" })
        // if (!password) return res.status(404).send({ status: false, msg: "please enter Password" })

        let Author = await AuthorModel.findOne({ email: email, password: password })
        if (!Author) return res.status(404).send({ status: false, msg: "incorrect emailId or password" });

        let token = JWT.sign(
            {
                userId: Author._id.toString(),
                creationTime: Date.now(),
                type: 'blogging-site-project'
            },
            "-- plutonium-- project-blogging-site -- secret-token --"
        )
        res.setHeader("x-api-key", token);
        
        return res.status(201).send({ status: true, data: token })
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}


module.exports = { login, createAuthor }