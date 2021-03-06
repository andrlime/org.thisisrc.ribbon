import express, { Request, Response } from "express";
import Student from "../models/student";
import School from "../models/school";
import Person from "../models/person";
import conn from "../db/conn";
import { sendRegistrationEmail, sendSchoolReceipt, sendSchoolCodeEmail, sendStudentReceipt } from "../email";

const router = express.Router();
const dbo = conn;

const genCode = () => {
    const numbers = ["2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L"];
    const letters = ["7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    return `${letters[Math.floor(Math.random()*27)]}${letters[Math.floor(Math.random()*27)]}${letters[Math.floor(Math.random()*27)]}-${numbers[Math.floor(Math.random()*18)]}${numbers[Math.floor(Math.random()*18)]}${numbers[Math.floor(Math.random()*18)]}`;
}

// schools
router.route("/schools/add").post((req: Request, res: Response) => {
    const dbConnect = dbo.getDb();
    const code = genCode();

    const contact: Person = {
        name: req.body.contact_name,
        email: req.body.contact_email,
        pronouns: req.body.pronouns || "they/them/theirs",
        position: req.body.contact_position
    }

    const school: School = {
        name: req.body.name,
        contact,
        code,
        count: 0,
        capacity: 10,
        students: []
    }

    sendSchoolReceipt(school);

    dbConnect.collection("schools").insertOne(school, (err: Error, resp: Response) => {
        if (err) throw err;
        res.json({response: resp, code});
    });
});

router.route("/schools/:code").get((req: Request, res: Response) => {
    const dbConnect = dbo.getDb();
    const query = { code: req.params.code };
    dbConnect
    .collection("schools")
    .findOne(query, (err: Error, result: Response) => {
        if (err) throw err;
        res.json(result);
    });
});

router.route("/schools/sendcode/:code").get((req: Request, res: Response) => {
    const dbConnect = dbo.getDb();
    const query = { code: req.params.code };
    dbConnect
    .collection("schools")
    .findOne(query, (err: Error, result: Response) => {
        if (err) throw err;
        sendSchoolCodeEmail(School.fromJson(result));
        res.json({success: true, school: School.fromJson(result)});
    });
});

// students
router.route("/students/add").post(async (req: Request, res: Response) => {
    const dbConnect = dbo.getDb();

    const id: Person = {
        name: req.body.contact_name,
        email: req.body.contact_email,
        pronouns: req.body.pronouns || "they/them/theirs"
    }

    const student: Student = {
        type: req.body.project_type,
        title: req.body.project_title,
        description: req.body.project_description,
        discipline: req.body.project_discipline,
        identity: id,
        school: req.body.school
    }

    dbConnect.collection("students").insertOne(student, (err: Error, resp: Response) => {
        if (err) throw err;
        
        sendStudentReceipt(student);
        //sendRegistrationEmail(student);
        res.json({response: resp});
    });
});

module.exports = router;
export default router;