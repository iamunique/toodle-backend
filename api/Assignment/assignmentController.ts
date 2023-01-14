import { Request, Response } from "express";
import { ErrorConstants, ServiceError } from "../../utils/errorHandler";
import mySQL from "../../utils/mySQL";
import { serviceConstants } from "../../utils/serviceConstants";

export const createAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = 'assignment_' + Date.now();
        const title = req.body.title
        const description = req.body.description
        const pubishTime = new Date(req.body.publishTime);
        const deadline = new Date(req.body.deadline);
        const userId = req.headers.userId
        var studentList = req.body.studentList || []
        if (pubishTime.toISOString() > deadline.toISOString()) throw new ServiceError(ErrorConstants.INVALID_REQUEST_PAYLOAD, `Invalid Dates`);

        await mySQL.InsertOrUpdate(`insert into ${serviceConstants.TABLES.ASSIGNMENT} (assignment_id,createdBy,title,publish_time,deadline,description) values(?,?,?,?,?,?)`, [assignmentId, userId, title, pubishTime, deadline, description]);

        //will send packet for background process if(students are in millions|| like assign to all students option)
        //to verify list of students and to assign them an assignment
        //RoleId 2 = student
        studentList = studentList.join("','")
        let assignedStudentCount = await mySQL.InsertOrUpdate(`insert into ${serviceConstants.TABLES.SUBMISSION} (assignment_id,userId) select '${assignmentId}' as assignmentId,userId from ${serviceConstants.TABLES.USER} where userId in ('${studentList}') and roleId = 2`, [])
        return res.json({ success: true, data: `Assignment created successfully with id ${assignmentId} and assigned to ${assignedStudentCount} students.` })
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const updateAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = req.params.assignmentId;
        let assignmentData = (await mySQL.GetData(`select * from assignment where assignment_id = '${assignmentId}'`))[0];
        if (!assignmentData) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `Invalid AssignmentId`);

        //updating any information for assignment
        const userId = req.headers.userId;
        const title = req.body.title || assignmentData.title;
        const description = req.body.description || assignmentData.description;
        const pubishTime = req.body.publishTime ? new Date(req.body.publishTime) : new Date(assignmentData.publish_time);
        const deadline = req.body.deadline ? new Date(req.body.deadline) : new Date(assignmentData.deadline);
        var studentList = req.body.studentList || [];
        if (pubishTime.toISOString() > deadline.toISOString()) throw new ServiceError(ErrorConstants.INVALID_REQUEST_PAYLOAD, `Invalid Dates`);

        await mySQL.InsertOrUpdate(`update ${serviceConstants.TABLES.ASSIGNMENT} set title = '${title}',description = '${description}',publish_time = ? ,deadline = ? where assignment_id = '${assignmentId}'`, [pubishTime, deadline])

        //adding new sudents or updating old students for assignments
        studentList = studentList.join("','")
        await mySQL.InsertOrUpdate(`insert into ${serviceConstants.TABLES.SUBMISSION} (assignment_id,userId) select '${assignmentId}' as assignmentId,userId from ${serviceConstants.TABLES.USER} where userId in ('${studentList}') and roleId = 2 on DUPLICATE KEY UPDATE assignment_id  = assignment_id`, [])
        return res.json({ success: true, data: `Assignment ${assignmentId} updated successfully.` })
    } catch (error: any) {
        console.log(error)
        return res.status(error.code || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const deleteAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = req.params.assignmentId;
        let status = await mySQL.InsertOrUpdate(`delete from ${serviceConstants.TABLES.ASSIGNMENT} where assignment_id = '${assignmentId}'`, [])
        if (status == 0) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `Invalid AssignmentId`);

        //else delete all student && assigment data from submission table
        await mySQL.InsertOrUpdate(`delete from ${serviceConstants.TABLES.SUBMISSION} where assignment_id = '${assignmentId}'`, [])
        return res.json({ success: true, data: `AssignmentId ${assignmentId} deleted successfully` })
    } catch (error: any) {
        return res.status(error.code || 500).send({ success: false, msg: error.info || error.message })
    }
}


export const submitAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = req.params.assignmentId;
        const submission = req.body.submission;
        const userId = req.headers.userId;
        let assignmentData = (await mySQL.GetData(`select * from ${serviceConstants.TABLES.ASSIGNMENT} where assignment_id = '${assignmentId}'`))[0]
        if (!assignmentData) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `Invalid AssignmentId`);
        if (assignmentData.publish_time > new Date().toISOString()) throw new ServiceError(ErrorConstants.UNAUTHORIZED_FOR_ACTION, `Assignment is not published yet`);

        let submissionStatus = (await mySQL.GetData(`select * from ${serviceConstants.TABLES.SUBMISSION} where assignment_id = '${assignmentId}' and userId = ${userId}`))[0]
        if (!submissionStatus) throw new ServiceError(ErrorConstants.UNAUTHORIZED_FOR_ACTION, `Assignment ${assignmentId} is not assigned to you`);
        if (submissionStatus.status == 1) return res.json({ success: true, data: `Assignment ${assignmentId} is already submitted` })

        await mySQL.InsertOrUpdate(`update ${serviceConstants.TABLES.SUBMISSION} set submission = '${submission}',status = 1 ,submission_ts = ? where assignment_id = '${assignmentId}' and userId = ${userId}`, [new Date()])
        return res.json({ success: true, data: `AssignmentId ${assignmentId} submitted successfully` })
    } catch (error: any) {
        console.log(error)
        return res.status(error.code || 500).send({ success: false, msg: error.info || error.message })
    }
}



export const getFeed = async (req: Request, res: Response) => {
    try {
        const userType = req.headers.userType;
        const userId = req.headers.userId;
        const offset = req.query.offset || 0;
        const limit = req.query.limit || 100;
        const status = req.query.status;
        var statusCondition = ''
        var data = []
        switch (status) {
            case 'PENDING': statusCondition = ` and b.status = 0 `
                break
            case 'OVERDUE': statusCondition = ` and (b.status = 0 and a.deadline < '${new Date().toISOString()}') `
                break
            case 'SUBMITTED': statusCondition = ` and b.status = 1 `
                break

            case 'ALL':
            default:
                break
        }

        switch (userType) {
            case 'Teacher': var publishedAt = req.query.publishedAt == 'SCHEDULED' ? ` and publish_time>= '${new Date().toISOString()}' ` : req.query.publishedAt == 'ONGOING' ? ` and (publish_time<= '${new Date().toISOString()}' and deadline> '${new Date().toISOString()}') ` : ``
                data = await mySQL.GetData(`select * from ${serviceConstants.TABLES.ASSIGNMENT} where createdBy = '${userId}' ${publishedAt} limit ${limit} offset ${offset}`);
                break;
            case 'Student': var publishedAt = req.query.publishedAt == 'SCHEDULED' ? ` and a.publish_time>= '${new Date().toISOString()}' ` : req.query.publishedAt == 'ONGOING' ? ` and (a.publish_time<= '${new Date().toISOString()}' and a.deadline> '${new Date().toISOString()}') ` : ``
                data = await mySQL.GetData(`select * from ${serviceConstants.TABLES.ASSIGNMENT} a left join ${serviceConstants.TABLES.SUBMISSION} b on(a.assignment_id=b.assignment_id) where b.userId = '${userId}' ${publishedAt} ${statusCondition} limit ${limit} offset ${offset}`);
                break;
            default: return res.status(401).json({ success: false, msg: "User not authorized" })
        }
        res.json({ success: true, data, count: data.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const getAssignment = async (req: Request, res: Response) => {
    try {
        const userType = req.headers.userType;
        const userId = req.headers.userId;
        const assignmentId = req.params.assignmentId;
        let assignmentData = (await mySQL.GetData(`select * from ${serviceConstants.TABLES.ASSIGNMENT} where assignment_id = '${assignmentId}'`))[0]
        if (!assignmentData) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `Invalid AssignmentId`);
        var data = [];

        switch (userType) {
            case 'Teacher': data = await mySQL.GetData(`select b.userId as submittedBy,b.status,b.score,b.submission_ts,submission from ${serviceConstants.TABLES.ASSIGNMENT} a left join ${serviceConstants.TABLES.SUBMISSION} b on(a.assignment_id=b.assignment_id) where b.assignment_id = '${assignmentId}'`);
                break;
            case 'Student': data = await mySQL.GetData(`select a.description,b.userId,b.status,b.score,b.submission_ts from ${serviceConstants.TABLES.ASSIGNMENT} a left join ${serviceConstants.TABLES.SUBMISSION} b on(a.assignment_id=b.assignment_id) where b.userId = '${userId}' and b.assignment_id = '${assignmentId}'`);
                break;
            default: res.status(401).json({ success: false, msg: "User not authorized" })
        }
        res.json({ success: true, data, count: data.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}