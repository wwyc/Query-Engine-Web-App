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

        let get: any = query.GET;//string or array of string
        let where:any= query.WHERE;
        //json object or json array
        let order: string = query.ORDER;
        let format: string = query.AS;
        let intermediate:Array<any>;
        if(typeof get==='string')
        intermediate=this.dealWithWhere(where,get);
        else
            intermediate=this.dealWithWhere(where,get[0]) ;
        let result:Array<any>;
        if(order!=null)
        { let values: Array<number>;
            for( var i=0;i<intermediate.length;i++)
            {
                for( var j=0;j<intermediate[i].length;j++)
                    if(intermediate[i][j].key===order)
                        values+=intermediate[i][j].value;
            }
            if (typeof values[0]==='number')
                intermediate=this.quickSortNumber(values,intermediate,0,values.length-1);
            if (typeof values[0]==='string')
                intermediate=this.quickSortLetter(values,intermediate,0,values.length-1);
        }
        result= this.represent(get,intermediate);
        result=JSON.parse('"render:"'+format+'","+"result"+":"'+result);
        //JSON.parse
        //return back to JSON object
        return {result:result};
       //return {status: 'received', ts: new Date().getTime()};
    }





//deal with where
    private  dealWithWhere(where:any,get:string):Array<any> {

        let arr:Array<any>;//dictionary
        let file:any=this.datasets[this.stringPrefix(get)];

        for (var i=0;i<file.length;i++)
        { for (var j=0;j<file[i].length;j++)
        { if (this.parserEBNF(where,file[i][j]))
        { arr=arr+file[i][j];
        } }}

        return arr;
    }


    private stringPrefix(get:string):string{
        let prefix:string;
        prefix=get.split("_")[0];
        return prefix;
    }
//NOT WORKING !
    private parserEBNF(where:any,dataset:Array<any>):boolean {
        //GT= > EQ= LT<
        //AND OR NOT
        // parse where
        //implemenntion of EBNF
        // and or follow array，
        // for loop
        let valid:boolean=true;



      if (typeof where.AND!=='undefined'||typeof where.OR!=='undefined')//can;t evaluate it

      {
          if (typeof where.AND !== 'undefined')

              for (var i = 0; i < where.AND.length - 1; i++) {
                  valid = valid && this.parserEBNF(where.AND[i], dataset) &&
                      this.parserEBNF(where.AND[i + 1], dataset);
              }
          else if (typeof where.OR !== 'undefined')
              for (var i = 0; i < where.OR.length - 1; i++){
              valid = valid && this.parserEBNF(where.OR[i], dataset)
                  || this.parserEBNF(where.OR[i + 1], dataset);
          }

      }

      else  if (typeof where.GT ||typeof where. EQ || typeof where.LT!=='undefined') {

            if (typeof where.GT!=='undefined') {
                valid = valid&&(dataset[where.GT.key] > where.GT.value);
            }

            else if (typeof where.EQ!=='undefined') {
                valid = valid&&(dataset[where.EQ.key] === where.EQ.value);
            }

            else if (typeof where.LT!=='undefined') {
                valid =valid&&(dataset[where.LT.key] < where.LT.value);
            }
        }

      else  if ('undefined' !== typeof where.IS) {
    valid = valid && (dataset[where.IS.key]
        === where.IS.value);
}
       else if(typeof where.NOT!=='undefined') {

                valid =valid&&(!this.parserEBNF(where.NOT, dataset));
            }

        return valid;
    }



//list in order in matter of chose data structure: mergesort?quicksort?
//    sort according to key’s value


    private   quickSortNumber(arr1: Array<any>,arr2:Array<any>,left: number,right: number):Array<any> {
        let pivot:number;
        if(left< right)
        {
            pivot=this.partitionNumber(arr1,arr2,left,right);
            this.quickSortNumber(arr1,arr2,left,pivot-1);
            this.quickSortNumber(arr1,arr2,pivot+1,right);
        }
        return arr2;
    }

    private partitionNumber(arr1: Array<any>,arr2:Array<any>, left: number, right: number):number{
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

    private swap(left:any,right:any){
        let temp:any=left;
        left=right;
        right=temp;
    }

    //sort words alphabetically
    private quickSortLetter(arr1:Array<any>,arr2:Array<any>, left:number,right:number):Array<any>{
        let pivot:number;

        if(left< right)
        {
            pivot=this.partitionString(arr1,arr2,left,right);
            this.quickSortLetter(arr1,arr2,left,pivot-1);
            this.quickSortLetter(arr1,arr2,pivot+1,right);
        }
        return arr2;
    }

    private partitionString(arr1: Array<any>,arr2:Array<any>, left: number, right: number):number{
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

    private represent(arr1:any, arr2:Array<any>):Array<any>{

        let arr3: Array<any>=[];

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
    }

}