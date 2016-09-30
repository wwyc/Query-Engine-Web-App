/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import forEach = require("core-js/fn/array/for-each");
import Session from '../DataStorage';
import {getRelativePath} from "tslint/lib/configuration";
import {error} from "util";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};                                       //wc:  could be anything in the curly brackets
}

export default class DatasetController {

    private datasets: Datasets = {};

    constructor() {
        Log.trace('DatasetController::init()');

    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): any {
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.
        //wc:  check if dataset is in memory

        if (this.datasets !== {} && this.datasets !== undefined){       // check if dataset/memory is empty

        var keys = Object.keys(this.datasets);  // check if dataset is in memory
            //     can we use containsKey(key: string): bool?
            for (var id1 of keys) {
            console.log(id1);
            if (id == id1){
                return this.datasets[id];
            }
        }}else {

        var fs = require('fs');             //check if dataset is in disk

        try {var data = fs.readFileSync("data/"+id+".json")}
        catch (err){
            Log.trace("File with given id Not Found")
            return null;
        }

        this.datasets[id] = JSON.parse(data);

        Log.trace("inside getdataset method" + JSON.stringify(this.datasets[id]))}

        /*fs.readFile("data/"+id+".json", function(err: string, data: any):any {
            // ...check if dataset on disk has same id as given id
            if (err)
                return null;
            this.datasets[id] = JSON.parse(data);
        });*/

        return this.datasets[id];           //return the dataset with the given id and it is now in memory
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

        if (this.datasets = {}) {                                  //check if datasets in memory is empty
            var fs = require('fs')
            fs.readdir("/data", (err: string, files: any) => {                       //read directory and return files (array of file names)

                    for (var file of files) {                               //iterate through array of file names and get all?
                        this.datasets[file.substring(0,(file.length() - 5))] = this.getDataset(file)
                        //.JSON is always 5 characters
                    }
                }
            )
        }

        return this.datasets;
    }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    let processedDataset = {};

                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    var stringPromise : any

                    var promiseArray:any = []

                    zip.forEach(function (Path: string, file: JSZipObject){
                        if (!file.dir) {
                            //Log.trace("iterating over filepath   " + Path)


                            stringPromise = file.async("string") // string from JSZipObject?

                            promiseArray.push(stringPromise)
                        }
                    })
                    Promise.all(promiseArray).then(function(endResult :any) {

                        //if (id == "courses") {

                        var courseArray: any = []

                        for (var m = 0, abc = endResult.length; m < abc; m++){

                            var courseObj = JSON.parse(endResult[m])

                            if (courseObj.result == undefined) {
                                Log.trace("course.Obj is NOT defined")
                            }


                            var sessions: any = []

                            for (var i = 0, len = courseObj.result.length; i < len; i++) {

                                var myJSONObject = courseObj.result[i]

                                var session = new Session()

                                session.courses_dept = myJSONObject["Subject"]
                                session.courses_id = myJSONObject["Course"]
                                session.courses_avg = myJSONObject["Avg"]
                                session.courses_instructor = myJSONObject["Professor"]
                                session.courses_title = myJSONObject["Title"]
                                session.courses_pass = myJSONObject["Pass"]
                                session.courses_fail = myJSONObject["Fail"]
                                session.courses_audit = myJSONObject["Audit"]

                                sessions[i] = session
                            }
                            courseArray[m] = sessions
                            }

                        Log.trace("length of sessions FINAL  =  " + sessions.length.toString())
                        Log.trace("length of courseArray FINAL  =  " + courseArray.length.toString())


                        processedDataset = courseArray

                        //}
                            that.save(id, processedDataset)

                    })

                    fulfill(true);
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // add it to the memory model
        this.datasets[id] = processedDataset;

        // TODO: actually write to disk in the ./data directory

        var fs = require('fs');
        var datasetToSave = JSON.stringify(processedDataset);
        fs.writeFile('data/'+id+'.json', datasetToSave, (err: string) => {
            // The file is created (if it does not exist) or truncated (if it exists).

        });
    }
}
