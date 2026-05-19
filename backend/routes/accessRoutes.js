const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { pin } = req.body;

  if (pin !== process.env.ACCESS_PIN) {
    return res.status(401).json({
      success: false,
      message: 'Invalid access code',
    });
  }

  res.json({
    success: true,
    message: 'Access granted',
  });
});

module.exports = router;
