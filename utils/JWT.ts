import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import mySQL from './mySQL';
import { serviceConstants } from './serviceConstants';

const JWT_SECRET = String(process.env.JWT_SECRET);
// const JWT_REFRESH = String(process.env.JWT_REFRESH);


export const generateToken = (data: any, time?: string) => {
    let expiresIn = time || "3hr";
    const accessToken = jwt.sign(data, JWT_SECRET, { expiresIn, algorithm: "HS256" });
    // const refreshToken = jwt.sign(data, JWT_REFRESH, { expiresIn: "3h", algorithm: "HS256" });
    // console.log({ accessToken, refreshToken });
    return accessToken;
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.headers.token;
        let username = req.headers.username;
        if (!token || !username) return res.status(404).json({ success: false, msg: "username and token are mandatory" });

        const decoded: any = jwt.verify(String(token), JWT_SECRET);
        if (decoded.email != String(username).toLowerCase()) return res.status(404).json({ success: false, msg: "Invalid username/token" });
        req.headers.userId = decoded.userId;
        next();
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }
};


export const validateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let username = req.headers.username;
        let userData = (await mySQL.GetData(`select title from ${serviceConstants.TABLES.USER} a left join user_roles b on (a.roleId = b.role_id) where email = '${username}'`))[0];
        if (userData && userData.title == 'Teacher') return next();
        return res.status(401).json({ success: false, msg: "User not authorized" });
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }

}

export const validateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let username = req.headers.username;
        let userData = (await mySQL.GetData(`select title from ${serviceConstants.TABLES.USER} a left join user_roles b on (a.roleId = b.role_id) where email = '${username}'`))[0];
        if (userData && userData.title == 'Student') return next();
        return res.status(401).json({ success: false, msg: "User not authorized" });
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }

}

export const validateUserType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let username = req.headers.username;
        let userData = (await mySQL.GetData(`select title from ${serviceConstants.TABLES.USER} a left join user_roles b on (a.roleId = b.role_id) where email = '${username}'`))[0];
        if (userData && userData.title) {
            req.headers.userType = userData.title
            return next();
        }
        return res.status(401).json({ success: false, msg: "User not authorized" });
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }

}



// JWT.verifyRefresh = (mobile, token) => {
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_REFRESH);
//         return decoded.mobile === mobile;
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// };