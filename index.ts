import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import authRouter from './api/Auth/authRouter';
import assignmentRouter from './api/Assignment/assignmentRouter';
import { isAuthenticated } from './utils/JWT';

dotenv.config()
const app: Express = express();
const port = process.env.PORT;
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    return res.json({ status: "Welcome to Toodle Backend-Interview", createdBy: "Sanket Kolte" })
})

app.use('/auth', authRouter)
app.use('/assignment', isAuthenticated, assignmentRouter)

app.listen(port, () => {
    console.log('Listening to port ', port)
})