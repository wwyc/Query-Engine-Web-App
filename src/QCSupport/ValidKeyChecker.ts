/**
 * Created by wchan on 2016-10-29.
 */

export default class ValidKeyChecker {

    public isvalidKey(key: any): any {
        var isvalidKeyResult: any
        if (key === "courses_dept" || key === "courses_id" || key === "courses_avg" ||
            key === "courses_instructor" || key === "courses_title" || key === "courses_pass" ||
            key === "courses_fail" || key === "courses_audit"||key=="courses_uuid"
            || key === "rooms_fullname"||key==="rooms_shortname"
            || key === "rooms_number"||key==="rooms_name"
            || key === "rooms_address"
            || key === "rooms_type"||key==="rooms_furniture"||key==="rooms_href"
            || key === "courses_audit"
            ||key==="rooms_lat"||key==="rooms_lon"||key==="rooms_seats"||key==="courses_size"||
            key==="courses_year"||key==="courses_name"||key==="courses_passrate"

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
            ||key==="rooms_lat"
            || key === "rooms_lon"||key==="rooms_seats"||key==="courses_size"||key==="courses_passrate"

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
            || key === "rooms_fullname"||key==="rooms_shortname"
            || key === "rooms_number"||key==="rooms_name"
            || key === "rooms_address"
            || key === "rooms_type"||key==="rooms_furniture"||key==="rooms_href"||key==="courses_year"
            ||key==="courses_name"
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