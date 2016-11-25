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
    public courses_size:number
    public courses_year:string
    public courses_name:string
    public courses_passrate:number
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
        this.courses_size=null
        this.courses_year=null
        this.courses_name=null
        this.courses_passrate=null
    }
}


