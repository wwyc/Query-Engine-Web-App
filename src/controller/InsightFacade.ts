/**
 * Created by wchan on 2016-10-17.
 */

/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController";
import Log from "../Util";
import DatasetController from "./DatasetController";
import fs = require('fs');

export default class InsightFacade implements IInsightFacade {

    private static datasetController = new DatasetController();

    // TODO: need to implement this
    

    addDataset(id:string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {

            let dcontroller = InsightFacade.datasetController;

            dcontroller.process(id, content).then(function (result:any) {

                if (result == true) {
                    if (dcontroller.getDatasets()[id] == null) {
                        // Dataset is not in disk
                        fulfill({code: 204, body: [result]});
                        Log.trace('InsightFacade::addDataset(..) - : dataset with this ID is new');

                    } else {
                        fulfill({code: 201, body: [result]});
                        Log.trace('InsightFacade::addDataset(..) - : dataset with this ID already exists');
                    }
                }

            }).catch(function (err: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR: ' + err.message);
                reject({code: 400, body: [err.message]});
            });

        })
    }

    removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function (fulfill, reject) {
            //Log.trace('InsightFacade::deleteDataset(..) - params: ' + id);

            return new Promise(function (fulfill, reject) {

                let dcontroller = InsightFacade.datasetController

                var datasetToDelete = dcontroller.getDataset(id)

                //  check if dataset is empty in memory or disk
                if (!(dcontroller.isEmpty(datasetToDelete) || (datasetToDelete == null))){

                    delete dcontroller.getDatasets()[id];
                    fs.unlinkSync(dcontroller.relativePath + "/data/" + id+".json")

                    Log.trace('InsightFacade::deleteQuery(..) - successful');
                    fulfill({code: 204, body: ["InsightFascade: removeDataset SUCCESS:  dataset with " +id+ " deleted"]})

                } else {
                    // produce error if not found in both memory or disk
                    Log.trace('InsightFacade::deleteQuery(..) - failed');
                    reject({code: 400, body: ["InsightFascade:  removeDataset FAILED:  dataset with " +id+ " not found"]})
                }

            });
        })
    }

    performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function (fulfill, reject) {


            let dcontroller = InsightFacade.datasetController;

            let datasets = dcontroller.getDatasets();

            Log.trace("RouteHandler-whatisinDatasets?"+Object.keys(dcontroller.getDatasets()))

            let qcontroller=new QueryController(datasets);
            let isValid=qcontroller.isValid(query);

            var GETKey=query.GET;
            var id:string

            if(isValid===true){

                if(typeof GETKey==='string'&&GETKey.includes("_")){
                    id=GETKey.split("_")[0];
                }else if(Array.isArray(GETKey)&&GETKey[0].includes("_")){
                    id=GETKey[0].split("_")[0];
                }
                //checkifdatasetwithidexists
                Log.trace(id)

                if(typeof datasets[id]=='undefined'){
                    //Log.error('RouteHandler::postQuery(..)-ERROR:'+'datasetnotfound');
                    reject({code: 424, body: ["InsightFascade: performQuery Failed:  dataset with " +id+ " missing"]})
                    //res.json(424,{missing:[id]});
                }
                else{
                    //dataset with id exits
                    //call query function and return results or catch error
                    try{
                        let qresult = qcontroller.query(query);
                        fulfill({code: 200, body: [qresult]})
                        //res.json(200,result);
                        //Log.trace('RouteHandler::postQuery(..)-:'+'querysuccess');

                    }catch(err){
                        //Log.error('RouteHandler::postQuery(..)-ERROR:'+'errorcaughtinquery()...invalidquery');
                        reject({code: 400, body: ["InsightFascade: performQuery Failed:  invalid query"]})
                        //res.json(400,{status:'invalidquery'});
                    }
                }
            }else{
                //Log.error('RouteHandler::postQuery(..)-ERROR:'+'isValid=false...invalidquery');
                reject({code: 400, body: ["InsightFascade: performQuery Failed:  invalid query"]})
            }
        })
    }
}