import { check, validationResult } from "express-validator"
import { Response, Request, NextFunction } from "express"

export const validateSignIn = [
    check('username').trim().normalizeEmail().isEmail().withMessage('Invalid email'),
    check('password').trim().isLength({ min: 8 }).withMessage('Please enter a password at least 8 character.')
]

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req).array()
    if (!result.length) return next()
    return res.status(400).json({ success: false, message: result })
}