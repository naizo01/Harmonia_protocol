const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const FIXED_IV = Buffer.alloc(IV_LENGTH, 0);
const SECRET_KEY = process.env.PRIVATE_KEY.replace(/^0x/, "");
const KEY = Buffer.from(SECRET_KEY, "hex");

function encrypt(text) {
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, FIXED_IV);
    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
}

function decrypt(encryptedText) {
    const encrypted = Buffer.from(encryptedText, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, FIXED_IV);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

module.exports = { encrypt, decrypt };
