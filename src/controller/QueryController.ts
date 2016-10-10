/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import {bodyParser} from "restify";
import {stringify} from "querystring";

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

        var isValidResult = false

//Log.trace(query.WHERE.toString())
//
//Log.trace(typeofquery.WHERE)
//Log.trace(Object.keys(query.WHERE).length.toString())
//
//Log.trace(Object.keys(query.WHERE).toString())
//
//Log.trace(typeofquery)
//
//Log.trace((typeofquery=='undefined').toString())

        if ((typeof query == 'undefined')
            || (query == null)
            || (Object.keys(query).length < 2)
            || (query.AS !== "TABLE")

        ) {
            return false;
        }

//checkifWHEREexistsorisitempty
        if ((typeof query.WHERE == 'undefined') || query.WHERE == null) {
            return false
        } else if (Object.keys(query.WHERE).length < 1) {
            return false
        }


        if (typeof query.GET === 'string') {
//checkifGETkeyisvalid&checkifORDERisequalinGETkey
            if (this.isvalidKey(query.GET) && (query.ORDER == null || query.ORDER == query.GET)) {
                isValidResult = true
            }

        } else if (Array.isArray(query.GET)) {

//gothrougheachelementofarrayandcheckifGETkeyisvalid
            for (var j = 0; j < Object.keys(query.GET).length; j++) {
                if (!this.isvalidKey(query.GET[j])) {
                    return false
                }
            }

//trytofindGETkeyinORDER
            if (query.ORDER !== null) {
                isValidResult = false
                for (var j = 0; j < Object.keys(query.GET).length; j++) {
                    if (query.ORDER == null || query.GET[j] == query.ORDER) {
                        isValidResult = true
                    }
                }

            }


        } else {
            isValidResult = false
        }


        return isValidResult;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');//json string

        // TODO: implement this

        var get = query.GET;                            // can be string or array of string
        var where = query.WHERE;                        //json object or json array
        var order = query.ORDER;
        var format = query.AS;

        var intermediate: any = [];

        if (typeof get === 'string') {
            intermediate = this.dealWithWhere(where, get)
        } else {
            intermediate = this.dealWithWhere(where, get[0])
        }

        var values: any = [];

        var finalResultObjArray: any = this.represent(get, intermediate);

        //Do this if order was requested
        if (order !== null) {
            finalResultObjArray = this.sortArray(finalResultObjArray, order);
        }

        Log.trace("this is FINAL result:  " + JSON.stringify(finalResultObjArray))

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

        if ((typeof where['AND'] == 'undefined')
            && (typeof where['OR'] == 'undefined')
            && (typeof where['GT'] == 'undefined')
            && (typeof where['LT'] == 'undefined')
            && (typeof where['EQ'] == 'undefined')
            && (typeof where['IS'] == 'undefined')
            && (typeof where['NOT'] == 'undefined')) {
            throw Error
        }
        ;

        if (typeof where['AND'] !== 'undefined' || typeof where['OR'] !== 'undefined') {
            //  Log.trace("type1!!!")
            if (typeof where['AND'] !== 'undefined') {
                var validList1: any = [];
                for (var ANDfilter of where['AND']) {
                    validList1.push(this.parserEBNF(ANDfilter, section));
                }
                //  Log.trace("validList1" + validList1);

                //  Log.trace("validlist1: "+validList1.length);
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
                //    Log.trace("validList2:" + validList2);
                /*     var ORfilter:any;
                 for (var key in where['OR'])
                 {
                 ORfilter=  where['OR'][key];
                 validList1.push(this.parserEBNF(ORfilter, section));}  */

                valid = false;

                for (var eachValid2 of validList2) {
                    if (eachValid2 === true) {
                        valid = true

                    }
                }
            }
        }


        if (typeof where['GT'] || typeof where['EQ'] || typeof where['LT'] !== 'undefined') {
            var numberRE = new RegExp("[1-9]*[0-9]+(.[0-9]+ )?");
            if (typeof where['GT'] !== 'undefined') {

                var whereKey1 = Object.keys(where['GT']).toString()
                var whereValue1 = where['GT'][Object.keys(where['GT'])[0]]

                if (this.isvalidKey(whereKey1) === false) {
                    throw Error
                }
                if (!numberRE.test(whereValue1.toString()))
                    throw Error;
                else
                valid = valid && (section[whereKey1] > whereValue1);
            }

            if (typeof where['EQ'] !== 'undefined') {
                var whereKey2 = Object.keys(where['EQ']).toString()
                var whereValue2 = where['EQ'][Object.keys(where['EQ'])[0]]
                if (this.isvalidKey(whereKey2) === false) {
                    throw Error
                }
                if (!numberRE.test(whereValue2.toString()))
                    throw Error;
                else
                valid = valid && (((section[whereKey2])) === whereValue2);
            }

            if (typeof where['LT'] !== 'undefined') {

                var whereKey3 = Object.keys(where['LT']).toString()
                var whereValue3 = where['LT'][Object.keys(where['LT'])[0]]
                if (this.isvalidKey(whereKey3) === false) {
                    throw Error
                }
                if (!numberRE.test(whereValue3.toString()))
                    throw Error;
                else
                valid = valid && (section[whereKey3] < whereValue3);

            }
        }

        if (typeof where['IS'] !== 'undefined') {
            var ISRE = new RegExp("^[\x20-\x7F]+$");
            var whereKey4 = Object.keys(where['IS']).toString();
            var whereValue4 = where['IS'][Object.keys(where['IS'])[0]];
            if (this.isvalidKey(whereKey4) === false) {
                throw Error
            }
            ;
            var sectionWhere = section[whereKey4];
            if (sectionWhere !== "") {
                if (whereValue4.substring(0, 1) === "*" && whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {

                    whereValue4 = whereValue4.substring(1, whereValue4.length - 1);
                    if (!ISRE.test(whereValue4))
                        throw  Error;
                    else
                    valid = valid && sectionWhere.includes(whereValue4);
                }
                else if (whereValue4.substring(0, 1) === "*") {
                    whereValue4 = whereValue4.substring(1, whereValue4.length);
                    if (!ISRE.test(whereValue4))
                        throw  Error;
                    else
                    valid = valid && (sectionWhere.substring(sectionWhere.length - whereValue4.length, sectionWhere.length) === whereValue4)
                }
                else if (whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    whereValue4 = whereValue4.substring(0, whereValue4.length - 1);
                    if (!ISRE.test(whereValue4))
                        throw  Error;
                    else
                    valid = valid && (sectionWhere.substring(0, whereValue4.length) === whereValue4)
                }
                else {
                    if (!ISRE.test(whereValue4))
                        throw  Error;
                    else
                    valid = valid && (sectionWhere === whereValue4);
                }
            }
            else
                valid = false;
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

    public isvalidKey(key: any): any {
        var isvalidKeyResult: any
        if (key === "courses_dept" || key === "courses_id" || key === "courses_avg" ||
            key === "courses_instructor" || key === "courses_title" || key === "courses_pass" ||
            key === "courses_fail" || key === "courses_audit"
        ) {
            isvalidKeyResult = true;
        } else {
            isvalidKeyResult = false;
        }
        return isvalidKeyResult;
    }

}
