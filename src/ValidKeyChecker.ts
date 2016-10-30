/**
 * Created by wchan on 2016-10-29.
 */

export default class ValidKeyChecker {

    public isvalidKey(key: any): any {
        var isvalidKeyResult: any
        if (key === "courses_dept" || key === "courses_id" || key === "courses_avg" ||
            key === "courses_instructor" || key === "courses_title" || key === "courses_pass" ||
            key === "courses_fail" || key === "courses_audit"||key=="courses_uuid"
        ) {
            isvalidKeyResult = true;
        } else {
            isvalidKeyResult = false;
        }
        return isvalidKeyResult;
    }

    public isvalidNumberKey(key: any): any {
        var isvalidKeyResult: any
        if (key === "courses_avg" ||
            key === "courses_pass" ||
            key === "courses_fail" || key === "courses_audit"
        ) {
            isvalidKeyResult = true;
        } else {
            isvalidKeyResult = false;
        }
        return isvalidKeyResult;
    }
    public isvalidStringKey(key: any): any {
        var isvalidKeyResult: any
        if (key === "courses_dept" ||
            key === "courses_id" ||
            key === "courses_instructor" || key === "courses_title"||key==="courses_uuid"
        ) {
            isvalidKeyResult = true;
        } else {
            isvalidKeyResult = false;
        }
        return isvalidKeyResult;
    }


    public contains(a:any, array:any):boolean{

        for (var i = 0; i < a.length; i++) {
            if (array[i] === a) {
                return true;
            }
        }
        return false;
    }

}