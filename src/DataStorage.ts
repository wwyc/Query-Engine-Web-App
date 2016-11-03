/**
 * Created by wchan on 2016-09-26.
 */


export default class Session{
    public courses_dept: string
    public courses_id: string
    public courses_avg: number
    public courses_instructor: string
    public courses_title: string
    public courses_pass: number
    public courses_fail: number
    public courses_audit: number
    public courses_uuid: string

    constructor(){
        this.courses_dept = null
        this.courses_id = null
        this.courses_avg = null
        this.courses_instructor = null
        this.courses_title = null
        this.courses_pass = null
        this.courses_fail = null
        this.courses_audit = null
        this.courses_uuid =null

    }
}


