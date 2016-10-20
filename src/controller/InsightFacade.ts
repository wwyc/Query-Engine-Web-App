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

    //private static datasetController = new DatasetController();

    // TODO: need to implement this


    addDataset(id:string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {

            try {

                let dcontroller = new DatasetController();

                var datasetexists = false

                //check if dataset with existing id exists
                if (dcontroller.getDatasets()[id] == null) {
                    datasetexists = true
                }

                dcontroller.process(id, content).then(function (result: Boolean) {

                    Log.trace("what is result   "  + result)

                    if (result == true) {
                        if (datasetexists) {
                            // Dataset is not in disk
                            fulfill({code: 204, body: [result]});
                            Log.trace('InsightFacade::addDataset(..) - : dataset with this ID is new');
                        } else {
                            fulfill({code: 201, body: [result]});
                            Log.trace('InsightFacade::addDataset(..) - : dataset with this ID already exists');
                        }
                    } else {
                        Log.trace('InsightFacade::addDataset(..) - processed dataset ERROR: Result is FALSE');
                        reject({code: 400, err: ["failed"]});

                    }

                }).catch(function (err: Error) {
                    Log.trace('InsightFacade::addDataset(..) - ERROR: ' + err.message);
                    reject({code: 400, err: [err.message]});
                });
            }catch (e) {
                Log.trace('InsightFascade::addDataset Failed(..) - ERROR: ' + e.message);
                reject({code: 400, err: [e.message]});
            }

        })
    }

    removeDataset(id: string): Promise<InsightResponse>{

            return new Promise(function (fulfill, reject) {
                Log.trace('InsightFacade::deleteDataset(..) - params: ' + id);

                try {

                    let dcontroller = new DatasetController();

                    var datasetToDelete = dcontroller.getDataset(id)

                    //  check if dataset is empty in memory or disk
                    if (!(dcontroller.isEmpty(datasetToDelete) || (datasetToDelete == null))) {

                        delete dcontroller.getDatasets()[id];
                        fs.unlinkSync(dcontroller.relativePath + "/data/" + id + ".json")

                        Log.trace('InsightFacade::deleteQuery(..) - successful');
                        fulfill({code: 204})

                    } else {
                        // produce error if not found in both memory or disk
                        Log.trace('InsightFacade::deleteQuery(..) - failed');
                        reject({code: 404, err: "InsightFascade: deleteDataset Failed:  dataset does not exist"})
                    }
                }catch (err) {
                    reject({code: 400, err: "InsightFascade: deleteDataset Failed: " + err.message})
                    Log.trace('InsightFascade::performQuery Failed(..) - ERROR: ' + err.message );

                }

            });
    }

    performQuery(query: QueryRequest): Promise<InsightResponse>{
        Log.trace("Inside InsightFascade: performQuery")
        return new Promise(function (fulfill, reject) {

            try {

                let dcontroller = new DatasetController();

                let datasets1 = dcontroller.getDatasets();

                if(typeof datasets1=='undefined'){
                    //Log.error('RouteHandler::postQuery(..)-ERROR:'+'datasetnotfound');
                    reject({code: 424, body: ["InsightFascade: performQuery Failed:  dataset with " +id+ " missing"]})
                    //res.json(424,{missing:[id]});
                }

                        //dataset with id exits
                        //call query function and return results or catch error
                        try {
                            let qcontroller = new QueryController(datasets1);
                            let isValid = qcontroller.isValid(query);
                            if (isValid == true) {

                                var id: string

                                var GETKey = query.GET;

                                if (typeof GETKey === 'string' && GETKey.includes("_")) {
                                    id = GETKey.split("_")[0];
                                } else if (Array.isArray(GETKey) && GETKey[0].includes("_")) {
                                    id = GETKey[0].split("_")[0];
                                }

                                if(typeof datasets1[id]=='undefined'){
                                    //Log.error('RouteHandler::postQuery(..)-ERROR:'+'datasetnotfound');
                                    reject({code: 424, body: ["InsightFascade: performQuery Failed:  dataset with " +id+ " missing"]})
                                    //res.json(424,{missing:[id]});
                                }

                                let qresult = qcontroller.query(query);
                                fulfill({code: 200, body: qresult})
                            } else {
                                reject({code: 400, err: "InsightFascade: performQuery Failed:  invalid query"})
                            }
                        } catch (err) {
                            reject({code: 400})
                            Log.trace('InsightFascade::performQuery Failed(..) - ERROR: invalid Query' );

                        }


            }catch (e) {
                Log.trace('InsightFascade::performQuery Failed(..) - ERROR: ' + e.message);
                reject({code: 400, err: "InsightFascade: performQuery Failed:  invalid query"})
            }
        })


    }
}