import express, { Router } from "express";
import * as authController from "./authController";
import { validate, validateSignIn } from "./authValidator";


const authRouter: Router = express.Router()

authRouter.post('/signIn', validateSignIn, validate, authController.signIn)

export default authRouter
