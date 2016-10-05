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
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');//json string

        // TODO: implement this

        //parse the json query to string
        var get = query.GET;                            // can be string or array of string
        var where = query.WHERE;                        //json object or json array
        var order = query.ORDER;
        var format = query.AS;

        var intermediate: any = []

        if(typeof get === 'string'){
            intermediate = this.dealWithWhere(where,get)
        } else {intermediate=this.dealWithWhere(where,get[0])}

        Log.trace("intermediate success")

        //var result: any = {}
        var values: any = []

        var finalResultObjArray: any = this.represent(get,intermediate);

        Log.trace("this is FINAL result:  "  + JSON.stringify(finalResultObjArray))

        //Do this if order was requested
        if(order !== null){
            Log.trace("INSIDE ORDER")

            finalResultObjArray=this.sortArray(finalResultObjArray,order);

            Log.trace("this is FINAL result:  "  + JSON.stringify(finalResultObjArray))

        }


        Log.trace("result type"+ typeof finalResultObjArray)

        return {render: format, result: finalResultObjArray};

    }

//deal with where
    public  dealWithWhere(where: any,get: any){
        var selectedSections:any = []

        //not able to access this.datasets directly; JSON.stringify and then parse it again fixed it
        var datasetsNew = JSON.parse(JSON.stringify(this.datasets))

        // Retrieve dataset from given GET
        var datasetRetrived = datasetsNew["courses"];

        var sections: any = []

        for (var key in datasetRetrived){
            //Log.trace(key.toString())
            sections = datasetRetrived[key]
            //Log.trace(sections.length)

            for (var key in sections){
                //Log.trace(key.toString())
                var section = sections[key]
                //Log.trace(section.toString())
                //Log.trace(section["courses_instructor"])

                if (this.parserEBNF(where,section)){
                    //add section to list if it meets WHERE criteria in query
                    selectedSections.push(section)}
            }
        }
        return selectedSections;
    }

    //helper function that returns prefix of string from GET
    public stringPrefix(get:string){
        let prefix: any
        prefix=get.split("_")[0];
        Log.trace(prefix);
        return prefix;
    }


    public parserEBNF(where:any,section:any) {
        //GT= > EQ= LT<
        //AND OR NOT
        // parse where
        //implemenntion of EBNF
        // and or follow array，
        // for loop
        let valid = true;
        //Log.trace("VALID ")

        if (typeof where['AND']!=='undefined'||typeof where['OR']!== 'undefined') {
            //Log.trace("type1!!!")
            if (typeof where['AND'] !== 'undefined') {
                for (var i of where['AND']) {
                    //if (where['AND'].hasOwnProperty(i))
                    //Log.trace("and type" + typeof i);
                    valid = valid && this.parserEBNF(i, section);
                    //Log.trace("AND success," + i[Object.keys(i)[0]]);
                }
            }

            if (typeof where['OR'] !== 'undefined') {
                for (var i of where['OR']) {
                    //if (where['AND'].hasOwnProperty(i))
                    //Log.trace("and type" + typeof i);
                    valid = valid || this.parserEBNF(i, section);
                    //Log.trace("AND success," + i[Object.keys(i)[0]]);
                }
            }
        }


        if (where['GT'] || where['EQ'] || where['LT']!== undefined) {

            if (where['GT']!== undefined) {

                //Log.trace("type of where" + typeof where['GT']);

                //Log.trace(Object.keys(where['GT']).toString());
                //Log.trace(where['GT'][Object.keys(where['GT'])[0]].toString())


                var whereKey = Object.keys(where['GT']).toString()
                var whereValue = where['GT'][Object.keys(where['GT'])[0]]


                //Log.trace(where['GT'].key.toString());

                valid = valid&&(section[whereKey] > whereValue);

                //Log.trace(dataset[Object.keys(where['GT'])[0]]);
                //Log.trace(where['GT'].value);
                //Log.trace("GT success");
            }

            if (where['EQ']!==undefined) {

                var whereKey = Object.keys(where['EQ']).toString()
                var whereValue = where['EQ'][Object.keys(where['EQ'])[0]]

                //valid = valid&&(section[where['EQ'].key]===where['EQ'].value);

                valid = valid&&(Math.floor((section[whereKey])) == whereValue);

                //Log.trace(dataset[where['EQ'].key]);
                //Log.trace(where['EQ'].value);
                //Log.trace("EQ SUCCESS");
            }

            if (where['LT']!== undefined) {

                //Log.trace("type of where" + typeof where['GT']);

                //Log.trace(Object.keys(where['GT']).toString());
                //Log.trace(where['GT'][Object.keys(where['GT'])[0]].toString())


                var whereKey1 = Object.keys(where['LT']).toString()
                var whereValue1 = where['LT'][Object.keys(where['LT'])[0]]


                //Log.trace(where['GT'].key.toString());

                valid = valid&&(section[whereKey1] < whereValue1);

                //Log.trace(dataset[Object.keys(where['GT'])[0]]);
                //Log.trace(where['GT'].value);
                Log.trace("LT success");
            }
        }

        if (where['IS']!==undefined) {

            var whereKey2 = Object.keys(where['IS']).toString()
            var whereValue2 = where['IS'][Object.keys(where['IS'])[0]]

            valid = valid&&(section[whereKey2] == whereValue2);

            //Log.trace("IS success");
        }

        if(typeof where['NOT']!=='undefined') {
            //Log.trace("type4!!!");
            valid =valid&&(!this.parserEBNF(where['NOT'],section));
            //Log.trace("NOT success");
        }

        return valid;
    }
    /**
     * Find the value from each section given key in GET
     *
     * @returns object for final result{[id: string: {}} returns empty if nothing was found
     */
    public represent (GETInput: any, sectionArray: any){

        //Log.trace("what is type of getArray:"  + Array.isArray(getArray))
        var resultArray:any = []

// Check to see if GET is string or Array
        if(typeof GETInput === 'string'){
            for (var sectionX of sectionArray){
                var resultObj : any ={}
                resultObj[GETInput] = sectionX[GETInput]
                resultArray.push(resultObj)
            }
        }
        else if(Array.isArray(GETInput)){

            for (var eachSection of sectionArray){
                var resultObj1 : any ={}
                for (var j = 0; j<Object.keys(GETInput).length; j++){
                    var key = GETInput[j]
                    resultObj1[key] = eachSection[key];
                }
                resultArray.push(resultObj1)
            }
            return resultArray;
        }}

    public sortArray(resultArray: any, order:any) {
        Log.trace("INSIDE sorting!")
        resultArray.sort(function (a: any, b: any) {
            var value1 = a[order];
            //Log.trace("value1  " + value1)
            var value2 = b[order];
            //Log.trace("value2  " + value2)
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
}