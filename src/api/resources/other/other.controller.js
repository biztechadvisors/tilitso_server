
module.exports = {

    async create(req, res, next) {
        try {
            console.log(req.body)
            return res.send(true)
        } catch (err) {
            console.log(err)
        }
    }
}