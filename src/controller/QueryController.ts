/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import {bodyParser} from "restify";
import {stringify} from "querystring";
import {type} from "os";

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
        var order = query.ORDER;
        Log.trace("order type"+ typeof order);
        var format = query.AS;
        Log.trace("Format"+ typeof format)
        var id:string;
        var intermediate: any = [];
        if (typeof get === 'string')
            id=this.stringPrefix(get);
        else
            id=this.stringPrefix(get[0]);
            intermediate = this.dealWithWhere(where, id);
        Log.trace("intermediate success");
        var isArr2 = Array.isArray(intermediate);
        Log.trace("intermediate"+isArr2);
        intermediate=this.sortArray(intermediate,order);
        Log.trace("intermediate2 type: " + typeof intermediate);
        var result: any = [];
        result = this.represent(get, intermediate);
        Log.trace("this is result:  " + result.toString());

    /*    try {
            FinalResult = JSON.parse(JSON.stringify(FinalResult));
        } catch (e) {
            Log.trace("Error msg parse 1" + e.message)
        }
        Log.trace("result type" +  FinalResult.toString());  */
        //return back to JSON object
        return {render: format, result: result};

    }

//deal with where

    public  dealWithWhere(where: any,id: any){
        var selectedSections:any = []

        //not able to access this.datasets directly; JSON.stringify and then parse it again fixed it
        var datasetsNew = JSON.parse(JSON.stringify(this.datasets))

        // Retrieve dataset from given GET
        var datasetRetrived = datasetsNew[id];

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
    public stringPrefix(get:string):string{
        let prefix: string
        prefix=get.split("_")[0];
        Log.trace(prefix);
        return prefix;
    }

    public sortArray(intermediate:Array<any>, order:any):Array<any>{
        Log.trace("sorting!")
        intermediate.sort(function (a: any, b: any) {
            var value1 = a[order];
            Log.trace("value1" + value1)
            var value2 = b[order];
            Log.trace("value2" + value2)
            if (value1 < value2) {
                return -1;
            }
            if (value1 > value2) {
                return 1;
            }

            return 0;
        });

        return intermediate;
    }


    public parserEBNF(where:any,section:any):boolean {
        Log.trace(where);
        var valid:boolean = true;
        Log.trace("VALID");
        if (typeof where['AND']!=='undefined'||typeof where['OR']!== 'undefined') {

            Log.trace("type1!!!")
            if (typeof where['AND'] !== 'undefined') {
                for (var i of where['AND']) {
                    if (where['AND'].hasOwnProperty(i))
                        Log.trace("and type" + typeof i);
                    valid = valid && this.parserEBNF(i, section);
                    Log.trace("AND success," + i[Object.keys(i)[0]]);
                }
            }


            if (typeof where['OR'] !== 'undefined') {
                for (var j of where['OR']) {
                    if (where['OR'].hasOwnProperty(j))
                        Log.trace("or type" + typeof j);
                    valid = valid || this.parserEBNF(j, section);
                    Log.trace("OR success," + j[Object.keys(j)[0]]);
                }
            }
        }

        if (typeof where['GT']!=='undefined'||typeof where['EQ']!=='undefined' || typeof where['LT']!=='undefined') {
            Log.trace("type2!!!")
            if (typeof where['GT']!=='undefined') {
                var wg=where['GT'];
                Log.trace("GT values"+ wg[Object.keys(wg)[0]])
                {
                    valid = valid&&(section[Object.keys(wg)[0]]> wg[Object.keys(wg)[0]])
                }
                    Log.trace(typeof where['GT']);
            }

            if (typeof where['EQ']!=='undefined') {
                var we = where['EQ'];
                Log.trace("EQ values" + we[Object.keys(we)[0]])
                {
                    valid = valid && (section[Object.keys(we)[0]] === we[Object.keys(we)[0]])
                    Log.trace(typeof where['EQ']);
                }
            }
                    if (typeof where['LT'] !== 'undefined') {
                    var wl = where['LT'];
                    Log.trace("LT values" + wl[Object.keys(wl)[0]])
                    {
                        valid = valid && (section[Object.keys(wl)[0]] < wl[Object.keys(wl)[0]])
                        Log.trace(typeof where['LT']);
                    }
                }
            }

        if (typeof where['IS']!=='undefined') {
            Log.trace("type3!!!");

            var wi=where['IS'];
            var wistring:string=wi[Object.keys(wi)[0]];
            Log.trace("IS "+ wi[Object.keys(wi)[0]]);
            wistring=wistring.split('*').join('');
            valid = valid && (section[Object.keys(wi)[0]].includes(wistring));
             Log.trace("IS reg :"+section[Object.keys(wi)[0]]);

        }

        if(typeof where['NOT']!=='undefined') {
            Log.trace("type4!!!");
            valid =valid&&(!this.parserEBNF(where['NOT'],section));
            Log.trace("NOT success");
        }

        return valid;
    }



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





    /*
        public represent(arr1: string|string[], arr2: Array<any>): Array<any> {
            var arr3: Array<any> = arr2;

            if (typeof arr1 === 'string') {

                for (var a = 0; a < arr2.length; a++) {
                    arr3[a]={};
                    arr3[a][arr1]=arr2[a][arr1];

                    /*  arr3[a] = arr1 + ":" + arr2[a][arr1];  */
      /*          Log.trace("arr3[a] " + typeof arr3[a]);
            }
        }
        else {
            for (var b = 0; b < arr2.length; b++) {
                for (var j = 0; j < arr1.length; j++) {
                    arr3[b]={};
                    arr3[b][arr1[j]]=arr2[b][arr1[j]];

                    /*   arr3[b] += arr1[j] + ":" + arr2[b][arr1[j]]; */
    /*            }

            }
        }
        var isArr = Array.isArray(arr3);
        Log.trace("arr3"+isArr);
        return arr3;

    }

*/


//list in order in matter of chose data structure: mergesort?quicksort?
//    sort according to key’s value

/*
    public   quickSortNumber(arr1: Array<any>,arr2:Array<any>,left: number,right: number):Array<any> {
        let pivot:number;
        if(left< right)
        {
            pivot=this.partitionNumber(arr1,arr2,left,right);
            this.quickSortNumber(arr1,arr2,left,pivot-1);
            this.quickSortNumber(arr1,arr2,pivot+1,right);
        }
        Log.trace("arr2 type"+typeof arr2);
        return arr2;
    }


    public partitionNumber(arr1: Array<any>,arr2:Array<any>, left: number, right: number):number{
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
    }

    public swap(left:any,right:any){
        let temp:any=left;
        left=right;
        right=temp;

    }

    //sort words alphabetically
    public quickSortLetter(arr1:Array<any>,arr2:Array<any>, left:number,right:number):Array<any>{
        let pivot:number;

        if(left< right)
        {
            pivot=this.partitionString(arr1,arr2,left,right);
            this.quickSortLetter(arr1,arr2,left,pivot-1);
            this.quickSortLetter(arr1,arr2,pivot+1,right);
        }
        return arr2;
    }

    public  partitionString(arr1: Array<any>,arr2:Array<any>, left: number, right: number):number{
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
    }


*/

/*
    public represent (arr1:string|string[], arr2:Array<any>):Array<any>{
        var arr3:Array<any>=arr2;

        if(typeof arr1==='string'){

            for (var a=0;a< arr2.length;a++){


           arr3[a]= arr1+":"+arr2[a][arr1];

                Log.trace("arr3[a] "+ arr3[a]);
            }

        }
        else {
            for (var b=0;b< arr2.length;b++)
                { for (var j=0;j<arr1.length;j++)
                { /* Object.keys(arr3[a])[j]=arr1[j];
                    Object.values(arr3[a])[j]=arr2[b][arr1[j]];*/
      /*         arr3[b]+=arr1[j]+":"+arr2[b][arr1[j]];  }


       }}
        Log.trace(JSON.parse(JSON.stringify(arr3)));
        return JSON.parse(JSON.stringify(arr3));

    }

*/
}