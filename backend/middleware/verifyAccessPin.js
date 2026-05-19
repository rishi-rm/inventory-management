module.exports = function verifyAccessPin(req, res, next) {
  const accessPin = req.headers['x-access-pin'];

  if (!accessPin || accessPin !== process.env.ACCESS_PIN) {
    return res.status(401).json({
      success: false,
      message: 'Invalid access code',
    });
  }

  next();
};
