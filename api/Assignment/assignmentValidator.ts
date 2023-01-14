import { check, validationResult } from "express-validator"
import { Response, Request, NextFunction } from "express"

export const validateCreateAssignment = [
    check('title').isLength({ min: 3, max: 20 }).withMessage('title is mandatory'),
    check('description').isString().withMessage('description is mandatory'),
    check('publishTime').isISO8601().toDate().withMessage('publishTime is mandatory in date format'),
    check('deadline').isISO8601().toDate().withMessage('deadline is mandatory in date format'),
    check('studentList').isArray().withMessage('studentList is mandatory'),

]

export const validateUpdateAssignment = [
    check('title').isLength({ min: 3, max: 20 }).optional().withMessage('title is mandatory'),
    check('description').isString().optional().withMessage('description is mandatory'),
    check('publishTime').isISO8601().toDate().optional().withMessage('publishTime is mandatory in date format'),
    check('deadline').isISO8601().toDate().optional().withMessage('deadline is mandatory in date format'),
    check('studentList').isArray().optional().withMessage('studentList is mandatory'),

]

export const validatesubmitAssignment = [
    check('submission').isString().withMessage('submission is mandatory'),
]


export const validate = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req).array()
    if (!result.length) return next()
    return res.status(400).json({ success: false, message: result })
}