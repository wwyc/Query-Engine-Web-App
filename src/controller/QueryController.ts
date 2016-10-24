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
    GROUP?:string[];
    APPLY?:any[];
    ORDER?: string|{};
    AS: string
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
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            isValidResult = true;

            //•	Kanga: APPLY without GROUP should not be valid.
            //•	Jonah: Empty GROUP should not be valid.
            if (typeof query.APPLY !== 'undefined'&& query.APPLY !== null) {
                if (typeof query.GROUP === 'undefined'||query.GROUP === null||query.GROUP.length===0) {
                    Log.trace("APPLY without GROUP should not be valid.")
                    Log.trace("Empty GROUP should not be valid.")
                    return false
                }
            }

            //•	Kodiak: GROUP without APPLY should not be valid.
            if (typeof query.GROUP !== 'undefined' && query.GROUP !== null) {
                if (typeof query.APPLY === 'undefined' ) {
                    Log.trace("GROUP without APPLY should not be valid.")
                    return false
                }

                //•	Liberation: Group should contains only valid keys (separated by underscore).
                for (var i = 0; i < query.GROUP.length; i++) {
                    // check if all keys in GROUP are presented in GET String
                    if (!this.isvalidKey(query.GROUP[i])) {
                        Log.trace("some keys in GROUP are not valid")
                        return false
                    }}


                //•	Kryptonite: All keys in GROUP should be presented in GET.
           for (var a = 0; a < query.GROUP.length; a++) {
                    //if GET is a string
                    if (typeof query.GET ==='string') {
                        if (!(query.GROUP[a] === query.GET)) {
                            Log.trace("All keys in GROUP should be presented in GET.")
                            return false
                        }
                    } else {
                        // check if all keys in GROUP are presented in GET Array
                        var ISinGetKey = false
                        for (var j = 0; j < query.GET.length; j++) {
                            if (query.GROUP[a] === query.GET[j]) {
                                ISinGetKey = true
                            }
                        }
                        if (!ISinGetKey) {
                            Log.trace("All keys in GROUP should be presented in GET.")
                            return false
                        }
                    }
                }


                //•	Laguna: If a key appears in GROUP or in APPLY, it cannot appear in the other one.
                for (var p = 0; p < query.GROUP.length; p++) {
                    var ISKeyinbothGROUPandAPPLY = false
                    for (var applyOBJ of query.APPLY) {
                        var applynewkey=Object.keys(applyOBJ)[0];//coursesAvg
                        var applyvalue=applyOBJ[Object.keys(applyOBJ)[0]];
                        var applytoken=Object.keys(applyvalue)[0];//AVG
                        var applystring=applyvalue[Object.keys(applyvalue)[0]];//courses_avg
                        if (query.GROUP[p] == applystring) {
                            ISKeyinbothGROUPandAPPLY = true
                        }
                    }
                    if (ISKeyinbothGROUPandAPPLY){
                        Log.trace("GROUP & APPLY cannot have the same keys")
                        return false
                    }
                }}

              //Kwyjibo: All keys in GET should be in either GROUP or APPLY.
            // Lorax: All keys in GET that are not separated by an underscore should appe

          if (typeof query.GET !== 'undefined'&& query.GET !== null)
            {
                if (typeof query.GET === 'string') {
                    if(this.isvalidKey(query.GET))
                    {  if (typeof query.GROUP !== 'undefined' && query.GROUP !== null&&
                    query.GROUP.length>0
                    )
                      if(!this.contains(query.GET,query.GROUP))
                      { Log.trace("All keys in GET should be in either GROUP or APPLY.")
                          return false;}
                    }
                    else
                    return false;
                }
                    else if(Array.isArray(query.GET))
                {  for (var s=0;s<query.GET.length;s++)
                {if(query.GET[s].includes("_"))
                {if(typeof query.GROUP !== 'undefined' && query.GROUP !== null
                    && query.GROUP.length>0)
                    { if(!(query.GROUP.includes(query.GET[s])))
                    {  Log.trace("All keys in GET should be in either GROUP or APPLY.")
                           return false; }}}
                    else
                    {  if(typeof query.APPLY !== 'undefined' && query.APPLY !== null&&
                     query.APPLY.length>0)
                    { var applyarray1:any=[]
                        for(var applyObject of query.APPLY)
                        {applyarray1.push(Object.keys(applyObject)[0])}
                            if(!(applyarray1.includes(query.GET[s])))
                        { Log.trace("All keys in GET should be in either GROUP or APPLY.")
                        return false; }}}}
                }}

          //Empty apply object should be accepted
                //Malibu: APPLY rules should be unique.
            if (typeof query.APPLY !== 'undefined'&& query.APPLY !== null)
            {   var applyarray:any=[]
                for(var applyObject of query.APPLY)
                {applyarray.push(Object.keys(applyObject)[0])}
                if(applyarray.length>1)
                {  applyarray.sort();
               for(var h=0; h<applyarray.length-1;h++)
              {
                 if(applyarray[h]===applyarray[h+1])
                 { Log.trace("duplicate keys found in APPLY")
                 return false;}
             }}
            }

        }

        return isValidResult;
    }
    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');//json string

        // TODO: implement this
        //parse the json query to string
        var get = query.GET;                            // can be string or array of string
        var where = query.WHERE;                        //json object or json array
        var group = query.GROUP;
        var apply = query.APPLY;
        var order = query.ORDER;
        var format = query.AS;

        var intermediate: any = [];
        var grouplist:any=[];
        if (typeof get === 'string') {

            intermediate = this.dealWithWhere(where, get)
        } else {
            intermediate = this.dealWithWhere(where, get[0])
        }

        if(group!==null&&typeof group!=='undefined'&& group.length>0)
        {
            intermediate=this.dealWithGroup(group,intermediate);
            if(apply!==null&&typeof apply!=='undefined'&&apply.length>0)
            { intermediate=this.dealWithApply(apply,intermediate);
        }}


        var finalResultObjArray: any = this.represent(get, intermediate);

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

            for (var section of sections) {
                      if(where!=null&&Object.keys(where).length>0&& where!=undefined)
                 { if (this.parserEBNF(where, section)) {
                 //add section to list if it meets WHERE criteria in query
                 selectedSections.push(section)}}
                 else
                 { selectedSections.push(section) }
                 }
               // selectedSections.push(section);
            }
        return selectedSections;
    }

    //helper function that returns prefix of string from GET
    /*    public stringPrefix(get: string) {
     let prefix: any
     prefix = get.split("_")[0];
     //Log.trace(prefix);
     return prefix;
     }*/

    public parserEBNF(where: any, section: any):boolean {

        let valid = true;

        if((typeof where['AND']=='undefined')
            &&(typeof where['OR']=='undefined')
            &&(typeof where['GT']=='undefined')
            &&(typeof where['LT']=='undefined')
            &&(typeof where['EQ']=='undefined')
            &&(typeof where['IS']=='undefined')
            &&(typeof where['NOT']=='undefined')){
            throw Error
        };

        if (typeof where['AND'] !== 'undefined' || typeof where['OR'] !== 'undefined') {
            //  Log.trace("type1!!!")
            if (typeof where['AND'] !== 'undefined') {
                var validList1: any = [];
                for (var ANDfilter of where['AND']) {
                    validList1.push(this.parserEBNF(ANDfilter, section));
                }
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

            if (typeof where['GT'] !== 'undefined') {

                var whereKey1 = Object.keys(where['GT']).toString()
                var whereValue1 = where['GT'][Object.keys(where['GT'])[0]]

                if(this.isvalidKey(whereKey1)===false){
                    throw Error
                };

                valid = valid && (section[whereKey1] > whereValue1);
            }

            if (typeof where['EQ'] !== 'undefined') {
                var whereKey2 = Object.keys(where['EQ']).toString()
                var whereValue2 = where['EQ'][Object.keys(where['EQ'])[0]]
                if(this.isvalidKey(whereKey2)===false){
                    throw Error
                };
                valid = valid && (((section[whereKey2])) === whereValue2);

            }

            if (typeof where['LT'] !== 'undefined') {

                var whereKey3 = Object.keys(where['LT']).toString()
                var whereValue3 = where['LT'][Object.keys(where['LT'])[0]]
                if(this.isvalidKey(whereKey3)===false){
                    throw Error
                }
                valid = valid && (section[whereKey3] < whereValue3);
            }
        }

        if (typeof where['IS'] !== 'undefined') {

            var whereKey4 = Object.keys(where['IS']).toString();
            var whereValue4 = where['IS'][Object.keys(where['IS'])[0]];
            if(this.isvalidKey(whereKey4)===false){
                throw Error
            };
            var sectionWhere = section[whereKey4];
            if (sectionWhere !== "") {
                if (whereValue4.substring(0, 1) === "*" && whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    var whereValue4 = whereValue4.split("*").join("");
                    valid = valid && sectionWhere.includes(whereValue4);
                }
                else if (whereValue4.substring(0, 1) === "*") {
                    var whereValue4 = whereValue4.split("*").join("");
                    valid = valid && (sectionWhere.substring(sectionWhere.length - whereValue4.length, sectionWhere.length) === whereValue4)
                }
                else if (whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    var whereValue4 = whereValue4.split("*").join("");
                    valid = valid && (sectionWhere.substring(0, whereValue4.length) === whereValue4)
                }
                else {
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
        }
        return resultArray
    }

    public dealWithGroup(group:any,intermediate:any):any{
        var groups:any=[];
        while(intermediate.length!=0)
        {   var sessions:any=[];
            var lastintermediates:any=[];
            var groupvalue:any={};

            for (var a=0;a<group.length;a++)
            {  var lastintermediate:any;
                lastintermediate=intermediate[0][group[a]];
                lastintermediates.push(lastintermediate);
                groupvalue[group[a]]=intermediate[0][group[a]];
            }
            sessions.push(groupvalue);
            for (var i=0;i<intermediate.length;i++)
            {  if(this.checkGroupCorrect(group,intermediate[i],lastintermediates))
            {   sessions.push(intermediate[i]);
                intermediate.splice(i,1);
                i--;
            }
            }
            groups.push(sessions);
        }
        Log.trace("groups length"+groups.length);
        return groups;
    }

    public checkGroupCorrect(group:any,intermediate:any,lastintermediates:any):boolean{
        var validlist:any=[];
        var valid:boolean=true;
        for (var i=0;i< group.length;i++)
        {
            if(intermediate[group[i]]===lastintermediates[i])
            {validlist.push(true);}
            else
            { validlist.push(false);}
        }

        for (var eachValid of validlist) {
            if (eachValid === false)
                valid = false;
        }
        return valid;
    }

    public dealWithApply(apply:any,grouplist:any):any {
        var applylist:any=[];

        Log.trace("jump into apply")
        for (var applyobject of apply) {
            var applynewkey=Object.keys(applyobject)[0];//coursesAvg
            var applyvalue=applyobject[Object.keys(applyobject)[0]];
            var applytoken=Object.keys(applyvalue)[0];//AVG
            var applystring=applyvalue[Object.keys(applyvalue)[0]];//courses_avg
            if (applytoken === 'AVG') {
                if(!this.isvalidNumberKey(applystring))
                    throw Error;
                else
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];

                        var sum: number=0;
                        var length:number=0;
                        for (var j=1;j<sessions.length;j++)
                        {
                            /*if( sessions[j][applystring]!=='undefined'&&
                                sessions[j][applystring]!=null)   */
                                sum+=sessions[j][applystring];
                            length++;
                        }
                        var averageValue: any;
                        averageValue = parseFloat((sum / length).toFixed(2));
                        grouplist[i][0][applynewkey]=averageValue;
                    }
            }

            if (applytoken === 'MIN') {
                if(!this.isvalidNumberKey(applystring))
                    throw Error;
                else
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var minsession:any=[];
                        var min:number=sessions[1][applystring];
                        for(var j=1;j<sessions.length;j++)
                        {   /*if(sessions[j][applystring]!='undefined'&&
                            sessions[j][applystring]!=null)  */
                        if (sessions[j][applystring]<min)
                            min=sessions[1][applystring]}

                        grouplist[i][0][applynewkey]=min;
                    }
            }

            if (applytoken === 'MAX') {
                if(!this.isvalidNumberKey(applystring))
                    throw Error;
                else
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                      var maxsession:any=[];
                        var max:number=sessions[1][applystring];
                        for(var j=1;j<sessions.length;j++)
                        { /* if(sessions[j][applystring]!='undefined'&&
                        sessions[j][applystring]!=null)  */
                        if(sessions[j][applystring]>max)
                            max=sessions[j][applystring]}

                        grouplist[i][0][applynewkey]=max;
                    }
            }


            if (applytoken === 'COUNT') {
                if (this.isvalidNumberKey(applystring)) {
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var count = 0;
                        var keysession: any = []
                        for (var j = 1; j < sessions.length; j++) {
                         /*   if (sessions[j][applystring] != 'undefined' &&
                                sessions[j][applystring] != null)  */
                                keysession.push(sessions[j][applystring])
                        }
                        if (keysession.length > 1) {
                            keysession.sort();
                            for (var h = 0; h < keysession.length - 1; h++) {
                                if (keysession[h] === keysession[h + 1]) {
                                    keysession.splice(h, 1)
                                    h--;
                                }
                            }
                        }
                        count = keysession.length;
                        grouplist[i][0][applynewkey] = count;
                    }
                }
                else if (this.isvalidStringKey(applystring)) {
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var count = 0;
                        var keysession: any = []
                        for (var j = 1; j < sessions.length; j++) {
                            if (sessions[j][applystring] != 'undefined' &&
                                sessions[j][applystring] != null &&
                                sessions[j][applystring].length > 0)
                                keysession.push(sessions[j][applystring])
                        }
                        if (keysession.length > 1) {
                            keysession.sort();
                            for (var h = 0; h < keysession.length - 1; h++) {
                                if (keysession[h] === keysession[h + 1]) {
                                    keysession.splice(h, 1)
                                    h--;
                                }
                            }
                        }
                        count = keysession.length;
                        grouplist[i][0][applynewkey] = count;
                    }
                }
                else
                    throw Error
            }

        }
        for (var i = 0; i < grouplist.length; i++){
            applylist.push(grouplist[i][0]);
        }
        return applylist;
    }

/*
    public checkArrayContain(groupobject2:any,applykeys:any):boolean{
        Log.trace("jump into check")
        var valid2:boolean;
        var validlist:any=[];
        var groupkeys:any=Object.keys(groupobject2[0])
        for (var applykey12 in applykeys){
            valid2=false;
            for(var groupkey12 in groupkeys)
            {   if(applykey12===groupkey12)
            { valid2=true;
                break;}
            }
            validlist.push(valid2)}

        for (var eachValid1 of validlist) {
            if (eachValid1 === false)
                valid2 = false;
        }
        Log.trace("valid2"+valid2);
        return valid2;

    }*/

    public sortArray(resultArray: any, order: any) {
        // Log.trace("INSIDE sorting!")
        resultArray.sort(function (a: any, b: any) {
            if (typeof order == "string") {
                //orderkey is a string
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

            }

            else
                var orderkey:any=order['keys'];//orderkey is an array
            var i=0;
            if(order['dir']==='UP')// lowers come first
            {  while(i<orderkey.length)
            {
                var value1 = a[orderkey[i]];
                var value2 = b[orderkey[i]];
                //    Log.trace("value1,2up"+value1+ value2)
                if (value1 < value2) {
                    return -1;
                }
                if (value1 > value2) {
                    return 1;
                }
                else
                    i++; }
                return 0;}

            if(order['dir']==='DOWN')
            {  while(i<orderkey.length)
            {
                var value1 = a[orderkey[i]];
                var value2 = b[orderkey[i]];
                //   Log.trace("value1,2down"+value1+ value2)
                if (value1 < value2) {
                    return 1;
                }
                if (value1 > value2) {
                    return -1;
                }
                else
                    i++; }
                return 0;}

        });
        return resultArray;
    }


    public isvalidKey(key:any):any{
        var isvalidKeyResult:any
        if(key==="courses_dept"||key==="courses_id"||key==="courses_avg"||
            key==="courses_instructor"||key==="courses_title"||key==="courses_pass"||
            key==="courses_fail"||key==="courses_audit"||key=="courses_uuid"
        ){
            isvalidKeyResult=true;
        }else{
            isvalidKeyResult=false;
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

    public isEmpty(myObject: any) {
        for(var key in myObject) {
            if (myObject.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
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