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


//parse the json querey to string

        var get: any = query.GET;//string or array of string
        var where:any= query.WHERE;
        //json object or json array
        var order: string = query.ORDER;
        var format: string = query.AS;

        var intermediate:Array<any>;
        if(typeof get==='string')
            intermediate=this.dealWithWhere(where,get);
        else
            intermediate=this.dealWithWhere(where,get[0]) ;
        Log.trace("intermediate success")
        var result:Array<any>;
        var values: Array<any>;
        if(order!=null)
        {
            for( var i of intermediate)
            {       Log.trace("intermediate loop1")
                    for( var j of i)
                    Log.trace("intermediate loop2")
                    Log.trace(j.key);
                    Log.trace(j.value);
                    if(j.key===order)   //maybe wrong
                        values+=j.value;//maybe
            }
            if (typeof values[0]==='number')
                intermediate=this.quickSortNumber(values,intermediate,0,values.length-1);
            if (typeof values[0]==='string')
                intermediate=this.quickSortLetter(values,intermediate,0,values.length-1);
        }
        result= this.represent(get,intermediate);
        result=JSON.parse('"render:"'+format+'","+"result"+":"'+result);
        //return back to JSON object
        return {result:result};

    }





//deal with where
    public  dealWithWhere(where:any,get:string):Array<any>{
        var arr:Array<any>;
        var file:{[id:string]:any}=this.datasets[this.stringPrefix(get)];

        for(var key in file) {
            var values = file[key];
        }
        for(var i in values){
            if (this.parserEBNF(where,i))
            {
            arr.push(i);
            }
        }
        Log.trace("success where and arr")
        return arr;
    }

    public stringPrefix(get:string):string{
        let prefix:string;
        prefix=get.split("_")[0];
        Log.trace(prefix);
        return prefix;
    }


//IS NOT WORKING !
    //try split!!!
    public parserEBNF(where:{[id:string]:any},dataset:any):boolean {
        //GT= > EQ= LT<
        //AND OR NOT
        // parse where
        //implemenntion of EBNF
        // and or follow array，
        // for loop
        let valid:boolean=true;
        Log.trace("VALID ")


        if (typeof where['AND']!=='undefined'||typeof where['OR']!=='undefined')//can;t evaluate it

        {  Log.trace("into and")
            if (typeof where['AND'] !== 'undefined')

            for (var i of where['AND']) {
                valid = valid && this.parserEBNF(i, dataset);
                Log.trace("AND success");
            }
            if (typeof where['OR'] !== 'undefined')
            for (var j of where['OR']){
                valid = valid || this.parserEBNF(i, dataset);
                Log.trace("OR success");
            }

        }
        if (typeof where['GT'] ||typeof where['EQ'] || typeof where['LT']!=='undefined') {

            if (typeof where['GT']!=='undefined') {
                Log.trace(where['GT']);
                valid = valid&&(dataset[where['GT'].key] > where['GT'].value);
                Log.trace(dataset[Object.keys(where['GT'])[0]]);
                Log.trace(where['GT'].value);
                Log.trace("GT success");
            }

            if (typeof where['EQ']!=='undefined') {

                valid = valid&&(dataset[where['EQ'].key]===where['EQ'].value);
                Log.trace(dataset[where['EQ'].key]);
                Log.trace(where['EQ'].value);
                Log.trace("EQ success");
            }

            if (typeof where['LT']!=='undefined') {
                Log.trace(where['LT']);
                valid =valid&&(dataset[where['LT'].key] < where['LT'].value);
                Log.trace("LT success");
            }
        }

        if (typeof where['IS']!=='undefined') {

            valid = valid && (dataset[where['IS'].key]
                === where['IS'].value);
            Log.trace("IS success");
        }
        if(typeof where['NOT']!=='undefined') {

            valid =valid&&(!this.parserEBNF(where['NOT'], dataset));
            Log.trace("NOT success");
        }

        return valid;
    }



//list in order in matter of chose data structure: mergesort?quicksort?
//    sort according to key’s value


    public   quickSortNumber(arr1: Array<any>,arr2:Array<any>,left: number,right: number):Array<any> {
        let pivot:number;
        if(left< right)
        {

            pivot=this.partitionNumber(arr1,arr2,left,right);

            this.quickSortNumber(arr1,arr2,left,pivot-1);
            this.quickSortNumber(arr1,arr2,pivot+1,right);
        }
        Log.trace(arr2.toString());
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
        Log.trace("swap success")
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





    public represent (arr1:string|string[], arr2:Array<any>):Array<any>{
        var arr3=arr2;
        if(typeof arr1==='string'){
            var i:number=Object.keys(arr2[0]).indexOf(arr1);
            for (var a of arr2){
                a=a[i];
                Log.trace(a);
            }

        }
        else if(typeof arr1==='Array')
            for (var b of arr2)
            { for (var j=0;j<arr1.length;j++)
             var temp=b;
                b=[];
            { var k:number=Object.keys(arr2[0]).indexOf(arr1[j]);
                b.push(temp[k]);
                Log.trace(b);
                }
            }

        return arr2;

    }

}