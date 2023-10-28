const { db } = require("../../../models")

module.exports = {

    async getWallet(req, res, next) {
        try {
            const { customerId } = req.body;
            const wallet = await db.wallet_point.findAll({
                where: customerId ? { customerId } : {},
            });
            return res.send({ status: 200, Data: wallet });
        } catch (err) {
            console.log(err);
        }
    }
}