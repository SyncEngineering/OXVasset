import { validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator.
 * Returns 400 with errors if validation fails.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

export default validateRequest;
