const bcrypt = require('bcryptjs');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const hash = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const compare = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

module.exports = { hash, compare };
