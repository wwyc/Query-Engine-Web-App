/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";


export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    GROUP:string[];
    APPLY:any[];
    ORDER: any[];
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

      /*  var isValidResult = false

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


        return isValidResult; */

        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;

    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');//json string

        // TODO: implement this

        var get = query.GET;                            // can be string or array of string
        var where = query.WHERE;                        //json object or json array
        var order = query.ORDER;
        var format = query.AS;
        var group=query.GROUP;
        var apply=query.APPLY;

        var intermediate: any = [];
        var grouplist:any=[];

        if (typeof get === 'string') {
            intermediate = this.dealWithWhere(where/*, get  */)
        } else {
            intermediate = this.dealWithWhere(where/*, get[0]*/)
        }
        if(group!==null && apply!=null)
        {
            grouplist=this.dealWithGroup(group,intermediate);
            intermediate=this.dealWithApply(apply,grouplist);
        }



        var finalResultObjArray: any = this.represent(get, intermediate);

        //Do this if order was requested
        if (order !== null) {
            finalResultObjArray = this.sortArray(finalResultObjArray, order);
        }

        Log.trace("this is FINAL result:  " + JSON.stringify(finalResultObjArray))

        return {render: format.toLowerCase(), result: finalResultObjArray};
    }

//deal with where
    public  dealWithWhere(where: any/*, get: any*/) {
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

                if (this.isvalidNumberKey(whereKey1) === false) {
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
                if (this.isvalidNumberKey(whereKey2) === false) {
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
                if (this.isvalidNumberKey(whereKey3) === false) {
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
            if (!ISRE.test(whereValue4))
                throw  Error;
            if (this.isvalidStringKey(whereKey4) === false) {
                throw Error
            }

            var sectionWhere = section[whereKey4];
            if (sectionWhere !== "") {
                if (whereValue4.substring(0, 1) === "*" && whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {

                    whereValue4 = whereValue4.substring(1, whereValue4.length - 1);

                    valid = valid && sectionWhere.includes(whereValue4);
                }
                else if (whereValue4.substring(0, 1) === "*") {
                    whereValue4 = whereValue4.substring(1, whereValue4.length);

                    valid = valid && (sectionWhere.substring(sectionWhere.length - whereValue4.length, sectionWhere.length) === whereValue4)
                }
                else if (whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    whereValue4 = whereValue4.substring(0, whereValue4.length - 1);

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

      /*  for(var sectionObject of sectionArray)
        {  */ var sections:any=[];
            for (var key in sectionArray) {
                sections = sectionArray[key];
                for(var i=0;i<sections.length;i++)
                {  var resultObj: any = {};
                   for(var a=0;a<GETInput.length;a++)
                   {  if(this.isvalidKey(
                           GETInput[a]
                       ))
                   {resultObj[GETInput[a]]=sections[i][GETInput[a]];
                       }
                      else
                   {    if(!Array.isArray(key))
                   {resultObj[GETInput[a]]=key[GETInput[a]]
                      }
                       else
                       {for(var m of key)
                       {
                       {if(Object.keys(m)[0]=== GETInput[a])
                       {
                           resultObj[GETInput][a]=m[GETInput[a]];

                       }
                       }}}
                   }}
                   resultArray.push(resultObj);
                }}

            return resultArray;
        }




    public sortArray(resultArray: any, order: any) {
        //Log.trace("INSIDE sorting!")
        resultArray.sort(function (a: any, b: any) {
            var orderkey:any=order['keys'];//orderkey is an array
          //  Log.trace("orderkey"+JSON.stringify(orderkey));
            var i=0;
            if(order['dir']==='DOWN')// lowers come first
            {  while(i<orderkey.length)
            {
                var value1 = a[orderkey[i]];
                var value2 = b[orderkey[i]];
              //  Log.trace("value1,2DOWN"+value1+ value2)
            if (value1 < value2) {
                return -1;
            }
            if (value1 > value2) {
                return 1;
            }
            else
            i++; }
            return 0;}

            if(order['dir']==='UP')
            {  while(i<orderkey.length)
            {
                var value1 = a[orderkey[i]];
                var value2 = b[orderkey[i]];
                Log.trace("value1,2UP"+value1+ value2)
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
     //   Log.trace("resultArray"+JSON.stringify( resultArray))
        return resultArray;

    }
   //group the data into list of map
    public dealWithGroup(group:any,intermediate:any):any{
        var groups:any=[];
        if(group.length===1)
        {while(intermediate.length!=0)
        {   var sessions:any=[];
            var groupMap: any = {}
            var groupvalue:any={};
            var lastintermediate:any;
            lastintermediate=intermediate[intermediate.length-1][group[0]];
        //  Log.trace("lastintermediate+"+ lastintermediate);
            for (var i=intermediate.length-1;i>=0;i--)
            {
              if(intermediate[i][group[0]]===lastintermediate)
              { Log.trace("lastintermediate+"+ lastintermediate);
                groupvalue[group[0]]=intermediate[i][group[0]];
                     sessions.push(intermediate[i]);
                    intermediate.splice(i,1);}
            }

            groupMap[groupvalue] = sessions;
            groups.push(groupMap);
            Log.trace("groupMap"+ JSON.stringify(groupMap));
        }
        Log.trace("groups length"+groups.length);
        }
        else {
            while(intermediate.length!=0)
            {   var sessions:any=[];
                var groupMap: any = {};
                var groupKey: any=[];
                var lastintermediates:any=[];
                for (var a=0;a<group.length;a++)
                {          var lastintermediate:any;
                    lastintermediate=intermediate[intermediate.length-1][group[a]];
                    lastintermediates.push(lastintermediate);
                }
                for (var i=intermediate.length-1;i>=0;i--)
                {  if(this.checkGroupCorrect(group,intermediate[i],lastintermediates))
                   //   Log.trace("groupcheck   "+  this.checkGroupCorrect(group,intermediate[i],lastintermediate))
                    {  Log.trace("lastintermediate+"+ lastintermediate);
                        for(var j=0;j<group.length;j++)
                        {   var groupvalue:any={};
                            groupvalue[group[j]]=intermediate[i][group[j]];
                            groupKey.push(groupvalue);
                        }
                        Log.trace("groupvalue"+groupvalue[Object.keys(groupvalue)[0]]);
                        sessions.push(intermediate[i]);
                        Log.trace("session.length"+sessions.length);
                        intermediate.splice(i,1); }
                }
                groupMap[groupKey] = sessions;
                groups.push(groupMap);
                Log.trace("groupMap"+ JSON.stringify(groupMap));
        }
                Log.trace("groups length"+groups.length);
        }
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

//deal with Apply
    public dealWithApply(apply:any,grouplist:any):any {
        Log.trace("jump into apply")
        for (var applyobject of apply) {
            var applynewkey=Object.keys(applyobject)[0];//coursesAvg
            var applyvalue=applyobject[Object.keys(applyobject)[0]];
            var applytoken=Object.keys(applyvalue)[0];//AVG
            var applystring=applyvalue[Object.keys(applyvalue)[0]];//courses_avg
            if (applytoken === 'AVG') {
                Log.trace("jump into AVG")
                if(!this.isvalidNumberKey(applystring))
                    throw Error;
                else
                for (var i = 0; i < grouplist.length; i++) {
                    var groupobject = grouplist[i];
                 //   Log.trace("groupobject"+groupobject)
                    var sessions: any = groupobject[Object.keys(groupobject)[0]];
                 //   Log.trace("sessions"+sessions);
                    var sum: any;
                    for (var j = 0; j < sessions.length; j++);
                    {
                        sum += sessions[j][applystring];
                    }
                    var averageValue: any;
                    averageValue = sum / sessions.length;
                 //   Log.trace("avg"+averageValue)// stuck here
                    newobject[applynewkey] = averageValue;
                    Object.keys(groupobject).push(newobject);
                   // Log.trace("key"+key);
                }
            }

            if (applytoken === 'MIN') {
                if(!this.isvalidNumberKey(applystring))
                    throw Error;
                else
                for (var i = 0; i < grouplist.length; i++) {
                    var groupobject = grouplist[i];
                    var key:any=Object.keys(groupobject)[0];
                    var sessions: any = groupobject[key];
                    var min: any;
                    for (var j = 0; j < sessions.length-1; j++);
                    {
                        if(sessions[j][applystring]<=sessions[j+1][applystring])
                        min = sessions[j][applystring];
                        else
                        min=sessions[j+1][applystring];
                    }
                    var newobject: any = {};
                    newobject[applynewkey] = min;
                    key.push(newobject);
                }

            }

            if (applytoken === 'MAX') {
                if(!this.isvalidNumberKey(applystring))
                    throw Error;
                else
                for (var i = 0; i < grouplist.length; i++) {
                    var groupobject = grouplist[i];
                    var key:any=Object.keys(groupobject)[0];
                    var sessions: any = groupobject[key];
                    var max: any;
                    for (var j = 0; j < sessions.length-1; j++);
                    {
                        if(sessions[j][applystring]>=sessions[j+1][applystring])
                            max = sessions[j][applystring];
                        else
                            max=sessions[j+1][applystring];
                    }
                    var newobject: any = {};
                    newobject[applynewkey] = max;
                     key.push(newobject);
                }
            }


            if (applytoken === 'COUNT') {
                for (var i = 0; i < grouplist.length; i++) {
                    var groupobject = grouplist[i];
                    var key:any=Object.keys(groupobject)[0];
                    var sessions: any = groupobject[key];
                    var count=0;
                    for (var j = 0; j < sessions.length-1; j++);
                    {   for (var a=0;a<Object.keys(sessions[j]).length;a++)
                        if(Object.keys(sessions[j])[a]===applystring)
                        {count+=1;}
                    }
                    var newobject: any = {};
                    newobject[applynewkey] = count;
                   key.push(newobject);
                }

                }
            }

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
        if (key === "courses_dept" || key === "courses_id" ||
            key === "courses_instructor" || key === "courses_title"
        ) {
            isvalidKeyResult = true;
        } else {
            isvalidKeyResult = false;
        }
        return isvalidKeyResult;
    }


}
