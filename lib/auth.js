/*
 * Auth stuff.
 */

const jwt = require('jsonwebtoken');

const secretKey = 'SuperSecret!';
const { UserSchema, insertNewUser, getUserById, validateUser, getUserByEmail } = require('../models/user');
exports.generateAuthToken = async function (useremail) {
  const user = await getUserByEmail(useremail);
  const payload = {
    sub: user._id
  };
  const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
  return token;
};

exports.requireAuthentication = function (req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    next();
  } catch (err) {
    console.error("  -- error:", err);
    res.status(401).send({
      error: "Invalid authentication token provided."
    });
  }
};
