import { ObjectId } from "mongodb";
import Person from "./person";
import Student from "./student"

export default class School {
    constructor (
        public name: string, // name of the school
        public contact: Person, // contact person
        public code: string, // school code
        public count: number, // amount of registrations under this school
	    public capacity: number, // defaults to 10. schools must email for more.
	    public students?: Student[], // list of students registering under this school
        public id?: ObjectId
    ) {}

    static fromJson = (json: any) => {
        return new School(
            json.name, new Person(json.contact.name, json.contact.email, json.contact.position), json.code, json.count, json.capacity
        ) || -1;
    }
}