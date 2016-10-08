/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";


export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string;
    AS: string;
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        // TODO: implement this


        var get = query.GET;
        var where = query.WHERE;
        var order = query.ORDER;
        var format = query.AS;
        var intermediate: any = [];

        if (format !== "TABLE")
            throw Error;
        if (typeof get === 'string') {
            if (this.isvalidKey(get) === false)
                throw Error;
            intermediate = this.dealWithWhere(where, get)
        } else {
            for (var i of get) {
                if (this.isvalidKey(i) === false)
                    throw Error;
            }
            intermediate = this.dealWithWhere(where, get[0])
        }
        var values: any = [];
        var finalResultObjArray: any = this.represent(get, intermediate);
        //Do this if order was requested
        if (order !== null && typeof order !== 'undefined') {
            if (this.isvalidKey(order) === false)
                throw Error;
            else
            finalResultObjArray = this.sortArray(finalResultObjArray, order);
        }
        Log.trace("this is FINAL result:  " + JSON.stringify(finalResultObjArray));
        return {render: format, result: finalResultObjArray};
    }

//deal with where
    public  dealWithWhere(where: any, get: any) {
        var selectedSections: any = []

        //not able to access this.datasets directly; JSON.stringify and then parse it again fixed it
        var datasetsNew = JSON.parse(JSON.stringify(this.datasets))

        // Retrieve dataset from given GET
        var datasetRetrived = datasetsNew["courses"];

        var sections: any = []

        for (var key in datasetRetrived) {
            sections = datasetRetrived[key]

            /*   for (var key in sections) {
             var section = sections[key]  */
            for (var section of sections) {
                if (this.parserEBNF(where, section)) {
                    //add section to list if it meets WHERE criteria in query
                    selectedSections.push(section)
                }
            }
        }
        return selectedSections;
    }

    //helper function that returns prefix of string from GET
    public stringPrefix(get: string) {
        let prefix: any
        prefix = get.split("_")[0];
        //Log.trace(prefix);
        return prefix;
    }


    public parserEBNF(where: any, section: any) {

        let valid = true;
        if (typeof where['AND'] !== 'undefined' || typeof where['OR'] !== 'undefined') {
            //  Log.trace("type1!!!")
            if (typeof where['AND'] !== 'undefined') {
                var validList1: any = [];
                for (var ANDfilter of where['AND']) {
                    validList1.push(this.parserEBNF(ANDfilter, section));
                }
                //   Log.trace("validList1" + validList1);

                for (var eachValid1 of validList1) {
                    if (eachValid1 === false)
                        valid = false;
                }
            }

            if (typeof where['OR'] !== 'undefined') {


                var validList2: any = [];
                for (var ORfilter of where['OR']) {
                    validList2.push(this.parserEBNF(ORfilter, section));
                }
                //      Log.trace("validList2:" + validList2);

                valid = false;

                for (var eachValid2 of validList2) {
                    if (eachValid2 === true) {
                        valid = true

                    }
                }
            }
        }


        if (typeof where['GT'] || typeof where['EQ'] || typeof where['LT'] !== 'undefined') {

            if (typeof where['GT'] !== 'undefined') {

                var whereKey1 = Object.keys(where['GT']).toString()
                var whereValue1 = where['GT'][Object.keys(where['GT'])[0]]
                //  Log.trace("GT type"+typeof whereValue1)
                if (this.isvalidKey(whereKey1) === false)
                    throw Error;
                //   if(numberRE.test(whereValue1.toString))
                valid = valid && (section[whereKey1] > whereValue1);
                //   else
                //    throw Error;
            }

            if (typeof where['EQ'] !== 'undefined') {
                var whereKey2 = Object.keys(where['EQ']).toString()
                var whereValue2 = where['EQ'][Object.keys(where['EQ'])[0]]
                if (this.isvalidKey(whereKey2) === false)
                    throw Error;
                //  if(/[1-9]*[0-9]+ ('.' [0-9]+ )?/.test(whereValue2))
                valid = valid && (((section[whereKey2])) === whereValue2);
                //   else
                //  throw Error;
            }

            if (typeof where['LT'] !== 'undefined') {

                var whereKey3 = Object.keys(where['LT']).toString()
                var whereValue3 = where['LT'][Object.keys(where['LT'])[0]]
                if (this.isvalidKey(whereKey3) === false)
                    throw Error;
                //   if(/[1-9]*[0-9]+ ('.' [0-9]+ )?/.test(whereValue3))
                valid = valid && (section[whereKey3] < whereValue3);
                // else
                //      throw Error;
            }
        }

        if (typeof where['IS'] !== 'undefined') {
            var ISexp = new RegExp('[a-zA-Z0-9,_-]+', 'g');
            var whereKey4 = Object.keys(where['IS']).toString();
            var whereValue4 = where['IS'][Object.keys(where['IS'])[0]];
            if (this.isvalidKey(whereKey4) === false)
                throw Error;

            var sectionWhere = section[whereKey4];

                if (whereValue4.substring(0, 1) === "*" && whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    whereValue4 = whereValue4.split("*").join("");
                    //    if (!ISexp.test(whereValue4))
                    //       throw Error;
                    //    else
                    valid = valid && sectionWhere.includes(whereValue4);

                }
                else if (whereValue4.substring(0, 1) === "*") {
                    whereValue4 = whereValue4.split("*").join("");
                    //     if (!ISexp.test(whereValue4))
                    //         throw Error;
                    //     else
                    valid = valid && (sectionWhere.substring(sectionWhere.length - whereValue4.length, sectionWhere.length) === whereValue4)

                }
                else if (whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    whereValue4 = whereValue4.split("*").join("");
                    //    if (!ISexp.test(whereValue4))
                    //        throw Error;
                    //    else
                    valid = valid && (sectionWhere.substring(0, whereValue4.length) === whereValue4)
                }

                else {
                    //  if (!ISexp.test(whereValue4))
                    //       throw Error;
                    //   else
                    valid = valid && (sectionWhere === whereValue4);

                }
            }

        if (typeof where['NOT'] !== 'undefined') {
            valid = valid && (!this.parserEBNF(where['NOT'], section));
        }

        return valid;
    }
    /**
     * Find the value from each section given key in GET
     *
     * @returns object for final result{[id: string: {}} returns empty if nothing was found
     */
    public represent(GETInput: any, sectionArray: any) {

        //Log.trace("what is type of getArray:"  + Array.isArray(getArray))
        var resultArray: any = []

// Check to see if GET is string or Array
        if (typeof GETInput === 'string') {
            for (var sectionX of sectionArray) {
                var resultObj: any = {}
                resultObj[GETInput] = sectionX[GETInput]
                resultArray.push(resultObj)
            }
        }
        else if (Array.isArray(GETInput)) {

            for (var eachSection of sectionArray) {
                var resultObj1: any = {}
                for (var j = 0; j < Object.keys(GETInput).length; j++) {
                    var key = GETInput[j]
                    resultObj1[key] = eachSection[key];
                }
                resultArray.push(resultObj1)
            }
            return resultArray;
        }
    }

    public sortArray(resultArray: any, order: any) {
        //Log.trace("INSIDE sorting!")
        resultArray.sort(function (a: any, b: any) {
            var value1 = a[order];
            //Log.trace("value1  " + value1)
            var value2 = b[order];
            if (value1 < value2) {
                return -1;
            }
            if (value1 > value2) {
                return 1;
            }
            return 0;
        });
        return resultArray;
    }

    public isvalidKey(key: string): boolean {
        var valid: boolean;
        if (key === "courses_dept" || key === "courses_id" || key === "courses_avg" ||
            key === "courses_instructor" || key === "courses_title" || key === "courses_pass" ||
            key === "courses_fail" || key === "courses_audit"
        )
            valid = true;
        else
            valid = false;
        return valid;
    }



}