import express, { Router } from "express";
import { validateStudent, validateTeacher, validateUserType } from "../../utils/JWT";
import * as assignmentController from "./assignmentController";
import { validate, validateCreateAssignment, validatesubmitAssignment, validateUpdateAssignment } from "./assignmentValidator";

const assignmentRouter: Router = express.Router()

assignmentRouter.post('/create', validateCreateAssignment, validate, validateTeacher, assignmentController.createAssignment)
assignmentRouter.put('/update/:assignmentId', validateUpdateAssignment, validate, validateTeacher, assignmentController.updateAssignment)
assignmentRouter.delete('/delete/:assignmentId', validateTeacher, assignmentController.deleteAssignment)
assignmentRouter.put('/submit/:assignmentId', validatesubmitAssignment, validate, validateStudent, assignmentController.submitAssignment)
assignmentRouter.get('/feed', validateUserType, assignmentController.getFeed)
assignmentRouter.get('/get/:assignmentId', validateUserType, assignmentController.getAssignment)

export default assignmentRouter
