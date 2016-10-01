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

        //extract the "get","where","order","as"'s value
        var get: any = query.GET;
        var where:any= query.WHERE;
        var order: string = query.ORDER;
        var format: string = query.AS;
        //get the array of the sections according to "where" requirement
        var intermediate:Array<any>;
        if(typeof get==='string')
            intermediate=this.dealWithWhere(where,get);
        else
            intermediate=this.dealWithWhere(where,get[0]);

        Log.trace("intermediate type: "+ typeof intermediate)
        Log.trace("intermediate success")

        var result:Array<any>;
        var values: Array<any>;
        //order the array
        if(order!=null)
        {
            for( var i of intermediate)

            {       Log.trace("intermediate loop1")
                    for( var j of i)
                        if (i.hasOwnProperty(j))
                    Log.trace("intermediate loop2")
                    Log.trace("j key is "+typeof j.key);
                    Log.trace("j value is"+typeof j.value);
                    if(j.key===order)   //maybe wrong
                        values+=j.value;//maybe
            }
            Log.trace("values type"+ typeof values)
            if (typeof values[0]==='number')
                intermediate=this.quickSortNumber(values,intermediate,0,values.length-1);
            if (typeof values[0]==='string')
                intermediate=this.quickSortLetter(values,intermediate,0,values.length-1);
        }
        Log.trace("intermediate2 type: "+ typeof intermediate)
        //represent according to the "get"
        result= this.represent(get,intermediate);
        Log.trace(result.toString())
        result=JSON.parse('"render:"'+format+'","+"result"+":"'+result);
        //return back to JSON object
        Log.trace("result type"+ typeof result)
        return {result:result};
    }





     //check each sections data to see if it satisfies "where" requirement
    public  dealWithWhere(where:{[id:string]:any},get:string):Array<any>{
        var arr:Array<any>;
        //get whole dataset
        var file:{[id:string]:any}=this.datasets[this.stringPrefix(get)];
        Log.trace('file type : '+ typeof file)
        //the file type is undefined!maybe fail to load data from dataset controller
        //get array of sections
        var values:Array<any>;
        for(var key in file) {
            if(file.hasOwnProperty(key))
            values = file[key];
        }
        Log.trace('values type '+ typeof values)
        for(var i in values){
            if(values.hasOwnProperty(i))
            if (this.parserEBNF(where,i))
            {
            arr.push(i);
            }
        }
        Log.trace("arr type"+ typeof arr)
        Log.trace("success where and arr")
        return arr;
    }
    //take out the string prefix, which is the id of dataset
    public stringPrefix(get:string):string{
        let prefix:string;
        prefix=get.split("_")[0];
        Log.trace(prefix);
        return prefix;
    }



    //parse the where part accordig to EBNF rule(try split later)
    //4 types of filter, use keys to find it
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
                Log.trace("AND success,type"+ typeof where['AND']);

            }
            if (typeof where['OR'] !== 'undefined')
            for (var j of where['OR']){
                if(where['OR'].hasOwnProperty(j))
                valid = valid || this.parserEBNF(i, dataset);
                Log.trace("OR success,type"+typeof where['OR']);
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




//    sort according to key’s value
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
// helper function for quicksort
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
//swap items, helper function for above one
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
  //helper function for sorting the words
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




//represent key value pairs according to get(arr1) from arr2(the array coming out from where parts)

    public represent (arr1:string|string[], arr2:Array<any>):Array<any>{
         var arr3:Array<any>=arr2;
        if(typeof arr1==='string'){
            var i:number=Object.keys(arr2[0]).indexOf(arr1);
            Log.trace("i type"+ typeof i)
            for (var a=0;a< arr2.length;a++){
                arr3[a]=arr2[a][i];
                Log.trace("arr3[a] type"+typeof arr3[a]);
        }
        }
        else if(typeof arr1==='Array') {
            for (var b of arr2)
                if (arr2.hasOwnProperty(b)) {
                    for (var j = 0; j < arr1.length; j++)
                         var temp = b;
                    b = [];
                    {
                        var k: number = Object.keys(arr2[0]).indexOf(arr1[j]);
                        b.push(temp[k]);
                        Log.trace("b" + b);
                    }
                }
            arr3 = arr2;
        }
            return arr3;
    }

}