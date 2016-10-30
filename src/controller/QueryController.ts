/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import {bodyParser} from "restify";
import {stringify} from "querystring";
import ValidKeyChecker from "../QCSupport/ValidKeyChecker";
import EBNFParser from "../QCSupport/EBNFParser";
import GAhandler from "../QCSupport/GROUPandAPPLYhandler";
import ResultsHandler from "../QCSupport/ResultsHandler";

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    GROUP?:string[];
    APPLY?:any[];
    ORDER?: string|{};
    AS: string;
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;
    public static ValidKeyChecker = new ValidKeyChecker();
    private static EBNFParser = new EBNFParser();
    private static GAhandler = new GAhandler();
    private static ResultsHandler = new ResultsHandler();


    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {

        var dcontroller = new DatasetController()

        var isValidResult = false

        //Check QUERY
        if ((typeof query == 'undefined')
            || (query == null)
            || (dcontroller.isEmpty(query))
            || (query.AS == null || typeof query.AS == 'undefined')
            || (query.GET == null || typeof query.GET == 'undefined')
            || (query.WHERE == null || typeof query.WHERE == 'undefined')
        ) {
            return false;
        }

        //Check GET keys
        if (typeof query.GET === 'string') {
            //check if GET key is valid & check if ORDER is equal in GET key
            if (QueryController.ValidKeyChecker.isvalidKey(query.GET) && (query.ORDER == null || query.ORDER == query.GET)) {
                isValidResult = true
            }
        } else if (Array.isArray(query.GET)) {
            //Metro: REST POST 400
            if (query.GET.length == 0){
                return false
            }

            //gothrougheachelementofarrayandcheckifGETkeyisvalid
            for (var j = 0; j < Object.keys(query.GET).length; j++) {
                if (query.GET[j].includes("_")) {
                    if (!QueryController.ValidKeyChecker.isvalidKey(query.GET[j])) {
                        return false
                    }
                }
            }
            //try to find GET key in ORDER
            if (query.ORDER !== null && !(typeof query.ORDER == 'undefined')) {
                isValidResult = false
                if (typeof query.ORDER == 'string') {
                    for (var j = 0; j < Object.keys(query.GET).length; j++) {
                        if (query.ORDER == null || query.GET[j] == query.ORDER) {
                            isValidResult = true
                        }
                    }
                } else if (typeof query.ORDER == 'object') {

                    isValidResult = true
                }
            } else {
                isValidResult = true
            }



        } else {
            isValidResult = true
        }

        //•	Kanga: APPLY without GROUP should not be valid.
        //•	Jonah: Empty GROUP should not be valid.
        if (typeof query.APPLY !== 'undefined'/*&& query.APPLY !== null*/) {
            if (typeof query.GROUP === 'undefined'||query.GROUP === null||query.GROUP.length===0) {
                Log.trace("APPLY without GROUP should not be valid.")
                Log.trace("Empty GROUP should not be valid.")
                return false
            }
        }

        //•	Kodiak: GROUP without APPLY should not be valid.
        if (typeof query.GROUP !== 'undefined' /*&& query.GROUP !== null*/) {
            if (typeof query.APPLY === 'undefined' ) {
                Log.trace("GROUP without APPLY should not be valid.")
                return false
            }

            //•	Liberation: Group should contains only valid keys (separated by underscore).
            for (var i = 0; i < query.GROUP.length; i++) {
                // check if all keys in GROUP are presented in GET String
                if (!QueryController.ValidKeyChecker.isvalidKey(query.GROUP[i])) {
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

                if(typeof query.APPLY !== 'undefined' && query.APPLY !== null&&
                    query.APPLY.length>0)
                { var applyarray1:any=[]
                    for(var applyObject of query.APPLY)
                    {applyarray1.push(Object.keys(applyObject)[0])}
                    if((applyarray1.includes(query.GROUP[p])))
                    { ISKeyinbothGROUPandAPPLY = true }}

                if (ISKeyinbothGROUPandAPPLY){
                    Log.trace("GROUP & APPLY cannot have the same keys")
                    return false
                }
            }}

        //Kwyjibo: All keys in GET should be in either GROUP or APPLY.
        // Lorax: All keys in GET that are not separated by an underscore should be in apply

        if (typeof query.GET !== 'undefined'&& query.GET !== null)
        {
            if (typeof query.GET === 'string') {
                if(QueryController.ValidKeyChecker.isvalidKey(query.GET))
                {  if (typeof query.GROUP !== 'undefined' && query.GROUP !== null&&
                    query.GROUP.length>0
                )
                    if(!QueryController.ValidKeyChecker.contains(query.GET,query.GROUP))
                    { Log.trace("All keys in GET should be in either GROUP or APPLY.")
                        return false;}

                        if (!query.GET.includes("_")) {
                            if (!QueryController.ValidKeyChecker.contains(query.GET, query.GROUP)) {
                                Log.trace("All keys in GET without underscore should be in APPLY.")
                                return false;
                            }
                        }
                }
                else
                    return false;
            }
            else if(Array.isArray(query.GET))
            {  for (var s=0;s<query.GET.length;s++) {
                if (query.GET[s].includes("_")) {
                    if (typeof query.GROUP !== 'undefined' && query.GROUP !== null
                        && query.GROUP.length > 0) {
                        if (!(query.GROUP.includes(query.GET[s]))) {
                            Log.trace("All keys in GET with underscore should be in GROUP.")
                            return false;
                        }
                    }
                }  else if (!query.GET[s].includes("_")) {

                    if(query.APPLY.length < 0){return false}

                        if (typeof query.APPLY !== 'undefined' && query.APPLY !== null /*&&
                            query.APPLY.length > 0*/) {
                            var applyarray1: any = []
                            for (var applyObject of query.APPLY) {
                                applyarray1.push(Object.keys(applyObject)[0])
                            }
                            if (!(applyarray1.includes(query.GET[s]))) {
                                Log.trace("All keys in GET without underscore should be in APPLY.")
                                return false;
                            }
                        }

                }
            }
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

        if (typeof get === 'string') {
            intermediate = this.dealWithWhere(where, get)
        } else {
            intermediate = this.dealWithWhere(where, get[0])
        }

        //var values: any = [];

        if(group!==null&&typeof group!=='undefined'&& group.length>0)
        {
            intermediate=QueryController.GAhandler.dealWithGroup(group,intermediate)
            if(apply!==null&&typeof apply!=='undefined'&&apply.length>0)
            { intermediate=QueryController.GAhandler.dealWithApply(apply,intermediate)}
            else
            { for(var h=0;h<intermediate.length;h++ )
                intermediate[h]=intermediate[h][0]
            }
        }

        var finalResultObjArray: any = QueryController.ResultsHandler.represent(get, intermediate);

        //Do this if order was requested
        if (order !== null) {
            finalResultObjArray = QueryController.ResultsHandler.sortArray(finalResultObjArray, order);
        }

        // Log.trace("this is FINAL result:  " + JSON.stringify(finalResultObjArray))
        // Log.trace("this is FINAL result:  " + JSON.stringify({render: format, result: finalResultObjArray}))

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
                { if (QueryController.EBNFParser.parseEBNF(where, section)) {
                    //add section to list if it meets WHERE criteria in query
                    selectedSections.push(section)}}
                else
                { selectedSections.push(section) }
            }

        }
        return selectedSections;
    }
/*
    //helper function that returns prefix of string from GET
    public stringPrefix(get: string) {
        let prefix: any
        prefix = get.split("_")[0];
        //Log.trace(prefix);
        return prefix;
    }*/











}

