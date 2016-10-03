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

        /*   1. parse the query(json format)
         2. transfer the key in datasets to what I want
         3. get ,where, order(chose a quick sort method), as ,
         4.check if the dataset in memory or disk
         5. return as which kind of data structure, */

//parse the json query to string

        var get = query.GET;//string or array of string
        var where = query.WHERE;
        //json object or json array
        var order = query.ORDER;
        var format = query.AS;

        var intermediate: any = []

        // GET can be a string of an array of strings
        if(typeof get === 'string')
            // if GET is a string such as "courses_dept"
            intermediate = this.dealWithWhere(where,get);
        else
        // if GET is a an array of strings
            intermediate=this.dealWithWhere(where,get[0]) ;
        //Log.trace("intermediate type: "+ typeof intermediate)
        Log.trace("intermediate success")

        //var result: any = {}
        //var values: any = []

        //Do this if order was requested
        /*if(order!=null)
        {
            for( var i of intermediate)
            {       Log.trace("intermediate loop1")
                for( var j of i)
                    if (i.hasOwnProperty(j))
                        Log.trace("intermediate loop2")
                Log.trace(j.key);
                Log.trace("j key is "+typeof j.key);
                Log.trace(j.value);
                Log.trace("j value is"+typeof j.value);
                if(j.key===order)   //maybe wrong
                    values+=j.value;//maybe
            }
            Log.trace("values type"+ typeof values)
            if (typeof values[0]==='number')
                intermediate=this.quickSortNumber(values,intermediate,0,values.length-1);
            if (typeof values[0]==='string')
                intermediate=this.quickSortLetter(values,intermediate,0,values.length-1);
        }*/

        Log.trace("intermediate2 type: "+ typeof intermediate)

        var finalResultObj: any = this.represent(get,intermediate);


        //Log.trace("this is result:  "  + finalResultObj.toString())



        Log.trace("this is FINAL result:  "  + JSON.stringify(finalResultObj))

        Log.trace("this is JSON string:  "  + "{\"render\":" + format + ","+"result"+":" + "[" + JSON.stringify(finalResultObj) + "]")



        //there is an error message here that requires fixing
        //try{
        //finalResultObj = JSON.parse("{\"render\":" + format + ","+"result"+":" + "[" + JSON.stringify(finalResultObj) + "]")

        finalResultObj = JSON.parse(JSON.stringify(finalResultObj))


        //}catch(e)
        //{Log.trace("Error msg parse 1" + e.message)}

        Log.trace("result type"+ typeof finalResultObj)

        //return back to JSON object
        return finalResultObj;

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

        //Log.trace('values type '+ typeof values)
        /*for(var section in sections){
            if(sections.hasOwnProperty(section))
                if (this.parserEBNF(where,section)){
                    arr.push(section);
                }
        }*/
        //Log.trace("arr type"+ typeof arr)
        //Log.trace("success where and arr")
        return selectedSections;
    }

    //helper function that returns prefix of string from GET
    public stringPrefix(get:string){
        let prefix: any
        prefix=get.split("_")[0];
        Log.trace(prefix);
        return prefix;
    }


//IS NOT WORKING !
    //try split!!!
    public parserEBNF(where:any,section:any) {
        //GT= > EQ= LT<
        //AND OR NOT
        // parse where
        //implemenntion of EBNF
        // and or follow array，
        // for loop
        let valid = true;
        //Log.trace("VALID ")

        /*if (where['AND']!==undefined||where['OR']!== undefined){//can;t evaluate it
          //Log.trace("into and")
            if (where['AND'] !== undefined){
                for (var i of where['AND']) {
                    valid = valid && this.parserEBNF(i, section);
                    //Log.trace("AND success,type"+ typeof where['AND']);
                }}

            if (where['OR'] !== undefined){
                for (var j of where['OR']){
                    if(where['OR'].hasOwnProperty(j))
                        valid = valid || this.parserEBNF(i, section);
                    //Log.trace("OR success,type"+typeof where['OR']);
                }}
        }*/


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
                Log.trace("EQ SUCCESS");
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

            Log.trace("IS success");
        }

        /*if(typeof where['NOT']!=='undefined') {
            valid =valid&&(!this.parserEBNF(where['NOT'], section));
            //Log.trace("NOT success");
        }*/
        return valid;
    }


//list in order in matter of chose data structure: mergesort?quicksort?
//    sort according to key’s value


    /*public   quickSortNumber(arr1: Array<any>,arr2:Array<any>,left: number,right: number):Array<any> {
        let pivot:number;
        if(left< right)
        {

            pivot=this.partitionNumber(arr1,arr2,left,right);

            this.quickSortNumber(arr1,arr2,left,pivot-1);
            this.quickSortNumber(arr1,arr2,pivot+1,right);
        }
        Log.trace("arr2 type"+typeof arr2);
        return arr2;

    }*/


    //
    /*public partitionNumber(arr1: Array<any>,arr2:Array<any>, left: number, right: number):number{
        let middle:number=left + (right - left) / 2;
        let pivot = arr1[middle];
        this.swap(arr1[middle],arr1[left]);
        this.swap(arr2[middle],arr2[left]);
        let a:number = left + 1;
        let b:number = right;
        while (a<=b) {
            while(a <= b && arr1[a] <= pivot) {
                a++;
            }

            while(a <= b && arr1[b] > pivot) {
                b--;
            }

            if (a < b) {
                this.swap(arr1[a], arr1[b]);
                this.swap(arr2[a], arr2[b]);
            }
        }
        this.swap(arr1[a - 1],arr1[left]);
        this.swap(arr2[a - 1],arr2[left]);
        return a - 1;
    }*/

    /*public swap(left:any,right:any){
        let temp:any=left;
        left=right;
        right=temp;

    }*/

    //method used to sort words alphabetically
    /*public quickSortLetter(arr1:Array<any>,arr2:Array<any>, left:number,right:number):Array<any>{
        let pivot:number;

        if(left< right)
        {
            pivot=this.partitionString(arr1,arr2,left,right);
            this.quickSortLetter(arr1,arr2,left,pivot-1);
            this.quickSortLetter(arr1,arr2,pivot+1,right);
        }
        return arr2;
    }*/

    /*public  partitionString(arr1: Array<any>,arr2:Array<any>, left: number, right: number):number{
        let middle:number=left + (right - left) / 2;
        let pivot = arr1[middle];
        this.swap(arr1[middle],arr1[left]);
        this.swap(arr2[middle],arr2[left]);
        let a:number = left + 1;
        let b:number = right;
        while (a<=b) {
            while(a <= b && arr1[a].charCodeAt(0)<=pivot) //a<right 需不需要,
            {
                a++;
            }

            while(a <= b && arr1[b].charCodeAt(0)>pivot) {
                b--;
            }

            if (a < b) {
                this.swap(arr1[a], arr1[b]);
                this.swap(arr2[a], arr2[b]);
            }
        }
        this.swap(arr1[a - 1],arr1[left]);
        this.swap(arr2[a - 1],arr2[left]);
        return a - 1;
    }*/

    /*   public represent(arr1:any, arr2:Array<any>):Array<any>{
     let arr3: Array<any> = arr2;
     if (typeof arr1!=='string') {
     for (var i = 0; i < arr2.length - 1; i++) {
     arr3[i] = "{";
     for (var j = 0; j < arr1.length - 1; j++) {
     arr3[i] = arr3[i] + arr1[j] + ":" + arr2[i].arr1[j] + ",";
     }
     arr3[i] = arr3[i] + arr1[arr1.length - 1] + ":" + arr2[i].arr1[arr1.length - 1] + "}"
     }
     arr3[i] = arr3[i] + "{" + arr1[arr1.length - 1] + ":" + arr2[i].arr1[arr1.length - 1] + "}";
     }
     else
     { for ( var a=0;a<arr2.length-1;a++) {
     arr3[a] = "{"+arr1 + ":" + arr2[a].arr1+ "}"+",";
     }
     arr3[a] =arr3[a]+ "{"+arr1 + ":" + arr2[a].arr1+"}";
     }
     return arr3;
     } */





    /**
     * Find the value from each section given key in GET
     *
     * @returns object for final result{[id: string: {}} returns empty if nothing was found
     */
// have problems!, how to get key value pair
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

}