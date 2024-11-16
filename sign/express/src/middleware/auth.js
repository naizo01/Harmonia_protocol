const ethers = require('ethers');

const verifySignature = async (req, res, next) => {
    try {
        const { message, signature, idToken } = req.body;
        const data = JSON.parse(message);

        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== data.address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // const decodedToken = await web3auth.verifyIdToken(idToken);

        // if (decodedToken.sub !== data.discordId) {
        //     return res.status(401).json({ error: 'Discord ID mismatch' });
        // }

        // const expectedAddress = web3auth.getAddressFromIdToken(idToken);
        // if (expectedAddress.toLowerCase() !== data.address.toLowerCase()) {
        //     return res.status(401).json({ error: 'Invalid address for this Discord user' });
        // }

        req.verifiedData = data;
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { verifySignature };
