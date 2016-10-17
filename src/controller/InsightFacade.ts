/**
 * Created by wchan on 2016-10-15.
 */

/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController"
import {default as DatasetController} from "./DatasetController"
import Log from "../Util";
import fs = require('fs');
import RouteHandler from "../rest/RouteHandler";

export default class InsightFacade implements IInsightFacade {


    // TODO: need to implement this

    addDataset(id:string, content: string): Promise<InsightResponse> {
            return new Promise(function (fulfill, reject) {
                try {

                let dController = new DatasetController()

                dController.process(id, content).then(function (result) {
                    if (dController.getDatasets()[id] == null) {
                        // Dataset is not in disk
                        Log.trace("INSIDE INSIGHTFACADE:  dataset with this ID is new")
                        fulfill({code: 204, body: [result]})
                    } else {
                        Log.trace("INSIDE INSIGHTFACADE:  dataset with this ID already exists!")
                        fulfill({code: 201, body: [result]})
                    }

                }).catch(function (err: Error) {
                    Log.trace('InsightFacade::addDataset(..) - ERROR: ' + err.message);
                    reject({code: 400, body: [err.message]})
                });

            }catch (err) {
                    Log.trace('InsightFacade::addDatasets(..) - ERROR: ' + err);
                    reject({code: 400, body: [err.message]});
                }

            }).catch(function (err: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR: ' + err.message);
            });


    }

    removeDataset(id: string): Promise<InsightResponse>{

        Log.trace('InsightFacade::deleteDataset(..) - params: ' + id);

        return new Promise(function (fulfill, reject) {

            let dcontroller = new DatasetController()

            var datasetToDelete = dcontroller.getDataset(id)

            if (!(dcontroller.isEmpty(datasetToDelete) || (datasetToDelete == null))){

                //  check if dataset is empty in memory or disk
                delete dcontroller.getDatasets()[id];

                Log.trace("InsightFascade: what is relativePath  " + dcontroller.relativePath)
                fs.unlinkSync(dcontroller.relativePath + "/data/" + id+".json")


                Log.trace('InsightFacade::deleteQuery(..) - successful');
                fulfill({code: 204, body: ["InsightFascade: removeDataset SUCCESS:  dataset with " +id+ " deleted"]})

            } else {
                // produce error if not found in both memory or disk
                reject({code: 400, body: ["InsightFascade:  removeDataset FAILED:  dataset with " +id+ " not found"]})
                //throw Error
            }

        });
    }

    performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function (fulfill, reject) {

            let dcontroller = new DatasetController()


            let datasets = dcontroller.getDatasets();

            Log.trace("RouteHandler-whatisinDatasets?"+Object.keys(dcontroller.getDatasets()))

            let controller=new QueryController(datasets);
            let isValid=controller.isValid(query);

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
                    Log.error('RouteHandler::postQuery(..)-ERROR:'+'datasetnotfound');
                    reject({code: 424, body: ["InsightFascade: performQuery Failed:  dataset with " +id+ " missing"]})
                    //res.json(424,{missing:[id]});
                }
                else{
                    //dataset with id exits
                    //call query function and return results or catch error
                    try{
                        let qresult = controller.query(query);
                        fulfill({code: 200, body: [qresult]})
                        //res.json(200,result);
                        Log.trace('RouteHandler::postQuery(..)-:'+'querysuccess');

                    }catch(err){
                        Log.error('RouteHandler::postQuery(..)-ERROR:'+'errorcaughtinquery()...invalidquery');
                        reject({code: 400, body: ["InsightFascade: performQuery Failed:  invalid query"]})
                        //res.json(400,{status:'invalidquery'});
                    }
                }
            }else{
                //throw error if Is Valid = false
                Log.error('RouteHandler::postQuery(..)-ERROR:'+'isValid=false...invalidquery');
                reject({code: 400, body: ["InsightFascade: performQuery Failed:  invalid query"]})
            }

        });
    }

}