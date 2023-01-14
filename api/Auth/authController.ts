import { Request, Response } from "express";
import { generateToken } from "../../utils/JWT";
import mySQL from "../../utils/mySQL";
import { serviceConstants } from "../../utils/serviceConstants";


export const signIn = async (req: Request, res: Response) => {
    try {
        const userName = req.body.username;
        const password = req.body.password;
        console.log('Inside', userName, password)
        var userData: any = (await mySQL.GetData(`select * from ${serviceConstants.TABLES.USER} where email = '${userName}'`))[0];

        if (!userData) {
            const userId = Date.now();

            //By Default if account does not exit (user will be created as student)
            const roleId = 2;
            await mySQL.InsertOrUpdate(`insert into ${serviceConstants.TABLES.USER} (userId,roleId,email,passwordHash) values(?,?,?,SHA(?))`, [userId, roleId, userName, password]);
            userData = (await mySQL.GetData(`select * from ${serviceConstants.TABLES.USER} where userId = '${userId}'`))[0];
        }

        delete userData.passwordHash;
        const token = generateToken(userData)
        return res.json({ success: true, token })
    } catch (error: any) {
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }

}