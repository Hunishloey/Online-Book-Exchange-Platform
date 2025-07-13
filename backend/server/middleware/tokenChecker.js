const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let token = req.headers['authorization']

    if (!!token)
        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err)
                res.send({ success: false, status: 300, message: "Unauthorized Access" })
            else
                next()
        })
    else
        res.send({ success: false, status: 403, message: "No token found" })
}