/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import forEach = require("core-js/fn/array/for-each");
import Session from '../DataStorage';



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

        var data = fs.readFileSync("data/"+id+".json")

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
        //var json = Utilities.JSONLoader.loadFromFile("../docs/location_map.json");

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

                    var fs = require('fs')

                    var stringPromise : any

                    myZip.forEach(function (Path: string, file: JSZipObject){
                    //Log.trace("iterating over" + Path)

                        stringPromise = file.async("string")

                    })
                    //Log.trace("just before saving dataset");

                    stringPromise.then(function(endResult :string) {
                        //Log.trace(endResult)

                        // if id == "courses"

                        try{ processedDataset = JSON.parse(endResult)
                        } catch (e){
                            Log.trace('DatasetController::process(..) - INVALID JSON ERROR:  ')}

                        var myJSONArray :any = processedDataset


                        var sessions: any = []

                        for (var i = 0, len = myJSONArray.result.length; i < len; i++) {

                            var myJSONObject = myJSONArray.result[i]

                            var session = new Session()

                            for (var j = 0, keys = Object.keys(myJSONObject).length; j < keys; j++) {

                                var myKey = Object.keys(myJSONObject)[j]

                                    if (myKey.toString() == "Subject"){
                                        session.courses_dept = myJSONObject.Subject}
                                    if (myKey.toString() == "id"){
                                        session.courses_id = myJSONObject.Course}
                                    if (myKey.toString() == "Avg"){
                                        session.courses_avg = myJSONObject.Avg}
                                    if (myKey.toString() == "Professor"){
                                        session.courses_instructor = myJSONObject.Professor}
                                    if (myKey.toString() == "Title"){
                                        session.courses_title = myJSONObject.Title}
                                    if (myKey.toString() == "Pass"){
                                        session.courses_pass = myJSONObject.Pass}
                                    if (myKey.toString() == "Fail"){
                                        session.courses_fail = myJSONObject.Fail}
                                    if (myKey.toString() == "Audit"){
                                        session.courses_audit = myJSONObject.Audit}
                            }
                            sessions[i] = session
                        }

                        processedDataset = sessions

                        Log.trace("length of sessions FINAL  =  " + sessions.length.toString())
                        //Log.trace("length of courseFile FINAL  =  " + courseFile.length.toString())

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
