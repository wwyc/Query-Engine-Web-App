/**
 * Created by wchan on 2016-10-17.
 */

/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController";
import Log from "../Util";
import fs = require('fs');
import DatasetController from "./DatasetController";
import {Datasets} from "./DatasetController";

export default class InsightFacade implements IInsightFacade {

    //private static datasetController = new DatasetController();

    // TODO: need to implement this


    addDataset(id: string, content: string): Promise<InsightResponse> {
        Log.trace('InsightFacade::addDataset(..) - : START');

        return new Promise(function (fulfill, reject) {
            try {
                let dcontroller = new DatasetController();
                var datasetexists = false
                //check if dataset with existing id exists
                if (dcontroller.getDatasets()[id] == null) {
                    datasetexists = true
                    Log.trace("Does Dataset with given id exist?" + datasetexists.toString())
                }

                dcontroller.process(id, content).then(function (result) {
                    Log.trace('InsightFacade::addDataset(..) - : AFTER DCONTROLLER.PROCESS');

                    if (result == true) {
                        if (datasetexists) {
                            // Dataset is not in memory or disk
                            Log.trace('InsightFacade::addDataset(..) - : 204 dataset with this ID is new');
                            return fulfill({code: 204, body: {}});
                        } else {
                            // Dataset is in memory or disk
                            Log.trace('InsightFacade::addDataset(..) - : 201 dataset with this ID already exists');
                            return fulfill({code: 201, body: {}});
                        }
                    } else if (result == false) {
                        Log.trace('InsightFacade::addDataset(..) - processed dataset ERROR: Result is FALSE');
                        return reject({code: 400, body: {}});

                    }

                }).catch(function (err: Error) {
                    Log.trace('InsightFacade::addDataset(..) - ERROR: 400 ' + err.message);
                    /*return*/ reject({code: 400, body: {}});
                });
            } catch (err) {
                Log.trace('InsightFascade::addDataset Failed(..) - ERROR: ' + err.message);
                /*return*/ reject({code: 400, body: {}});
            }

        })
    }

    removeDataset(id: string): Promise<InsightResponse> {

        return new Promise(function (fulfill, reject) {
            Log.trace('InsightFacade::removeDataset(..) - params: ' + id);

            try {

                let dcontroller = new DatasetController();

                var datasetToDelete = dcontroller.getDataset(id)

                //  check if dataset is empty in memory or disk
                if (!(datasetToDelete == null)) {

                    delete dcontroller.getDatasets()[id];
                    fs.unlinkSync(dcontroller.relativePath + "/data/" + id + ".json")

                    Log.trace('InsightFacade::removeDataset(..) - 204 successful');
                    fulfill({code: 204, body: {}});

                } else {
                    // reject if not found in both memory or disk
                    Log.trace('InsightFacade::removeDataset(..) - 404 failed');
                    return reject({code: 404, body: {}});
                }
            } catch (err) {
                Log.trace('InsightFascade::removeDataset Failed(..) - 404 ERROR: ' + err.message);
                return reject({code: 404, body: {}});
            }

        });
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
        Log.trace("Inside InsightFascade: performQuery START")
        return new Promise(function (fulfill, reject) {

            try {
                let dcontroller = new DatasetController();
                let datasets1: Datasets = dcontroller.getDatasets();

/*                if (typeof datasets1 == 'undefined'||(datasets1 == null)||dcontroller.isEmpty(datasets1)){
                        let qcontroller = new QueryController(datasets1);
                        if (qcontroller.isValid){
                            Log.error('RouteHandler::postQuery(..)-ERROR: dataset with id not found');
                            return fulfill({code: 424, body: {}})
                        } else {
                            // throw Error?
                            return reject({code: 400, body: {}})
                        }
                    }*/

                let qcontroller = new QueryController(datasets1);

                let isValid = qcontroller.isValid(query);
                    if (isValid) {

                        if (typeof datasets1 == 'undefined'||(datasets1 == null)||dcontroller.isEmpty(datasets1)){
                            let qcontroller = new QueryController(datasets1);

                                Log.error('RouteHandler::postQuery(..)-ERROR: dataset with id not found');
                                return fulfill({code: 424, body: {}})
                            } 

                        let queryResult = qcontroller.query(query);
                        Log.trace('InsightFascade::performQuery(..) - SUCCESS')
                        /*return*/ fulfill({code: 200, body: queryResult})
                    } else {
                        Log.trace('InsightFascade::performQuery Failed(..) - ERROR: ');
                        return reject({code: 400, error: "invalid query"})
                    }

            } catch (err) {
                Log.trace('InsightFascade::performQuery Failed(..) - ERROR: ' + err.message);
                return reject({code: 400, error: "invalid query"})
            }
        })
    }
}