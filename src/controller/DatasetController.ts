/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import forEach = require("core-js/fn/array/for-each");
import Session from '../DataStorage';
import {error} from "util";


/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
    //anything in the curly brackets
}

export default class DatasetController {

    private datasets: Datasets = {};
    public relativePath: any

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

        //Log.trace("inside getDataset(id) 1   " + process.cwd())
        this.relativePath = process.cwd()

        // check if dataset/memory is empty
        if (!(this.isEmpty(this.datasets) || (typeof this.datasets == "undefined"))){

            //Log.trace("INSIDE getDataset: dataset is in memory")
            var keys = Object.keys(this.datasets);
            for (var id1 of keys) {
                Log.trace(id1);
                if (id == id1){
                    return this.datasets[id];
                }
            }}  else {

            //check if dataset is in disk
            var fs = require('fs');

            //Log.trace("inside getDataset(id)    " + this.relativePath)

            try {var data = fs.readFileSync(this.relativePath + "/data/"+id+".json")
                //Log.trace("dataset is in disk")
            }
            catch (err){
                //Log.trace("inside getDataset:  dataset with given id Not Found")
                return null;
            }

            this.datasets[id] = JSON.parse(data);
            //Log.trace("inside getdataset() method" + JSON.stringify(this.datasets[id]))
            }

        return this.datasets[id];
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

        let that = this;

        Log.trace("INSIDE getDatasets():  this.datasets - is it empty?:  " + this.isEmpty(this.datasets))

        if (this.isEmpty(this.datasets)|| (typeof this.datasets == "undefined")) {
            //check if datasets in memory is empty
            var fs1 = require('fs');
            //read directory and return files (array of file names)

            that.relativePath = process.cwd()

            //Log.trace(that.relativePath)

            var Files=(fs1.readdirSync(that.relativePath+"/data/"))

            for(var file of Files){

                //Log.trace(file)
                //Log.trace("file.split[0]"+file.split(".")[0])

                var fileName=file.split(".")[0]
                this.datasets[fileName]=this.getDataset(fileName)
            }

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

        var isValidDataset: any = false

        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    let processedDataset: any = {};
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    var stringPromise : any

                    var promiseArray:any = []

                    zip.forEach(function (Path: string, file: JSZipObject){

                        if (file.dir){
                            //(isValidDataset = false)
                            //Log.trace("iterating over" + Path)
                             if (Path.includes(id))
                             {isValidDataset = true}
                   }
                        if (!file.dir) {
                            //(isValidDataset = false)
                            if (file.name = id)
                            {isValidDataset = true}

                            stringPromise = file.async("string") // string from JSZipObject?
                            promiseArray.push(stringPromise)
                        }
                    })

                    //Log.trace("PromiseArray length:  "+ promiseArray.length);

                    Promise.all(promiseArray).then(function(endResult: any) {

                        Log.trace("INSIDE PROMISE ALL")

                        Log.trace("endResult:  "+ endResult.length);

                        if (id == "courses") {

                            let courseMap: any = {}

                            for (var objs of endResult) {

                            var courseObj = JSON.parse(objs)

                                if (courseObj.result.length !== 0) {

                                    var sessions: any = []

                                    for (var obj of  courseObj.result) {
                                        var session = new Session()

                                        session.courses_dept = obj["Subject"]
                                        session.courses_id = obj["Course"]
                                        session.courses_avg = obj["Avg"]
                                        session.courses_instructor = obj["Professor"]
                                        session.courses_title = obj["Title"]
                                        session.courses_pass = obj["Pass"]
                                        session.courses_fail = obj["Fail"]
                                        session.courses_audit = obj["Audit"]

                                        sessions.push(session)
                                    }
                                }

                                if (typeof sessions !== "undefined") {
                                    courseMap[session.courses_dept + session.courses_id] = sessions
                                }
                        }
                        processedDataset = courseMap
                        }
                        //Log.trace("before saving dataset")
                        that.save(id, processedDataset)
                    })

                    //Log.trace("after saving dataset")


                    if (isValidDataset == false){
                        //reject(true)
                        throw Error
                    }

                    fulfill(true)

                    Log.trace("processedDataset FINAL type" + typeof processedDataset)

                }).catch(function (err) {
                    Log.error('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        })


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

        var fs2 = require('fs');

        var datasetToSave = JSON.stringify(processedDataset);

        try {
            fs2.writeFileSync('data/' + id + '.json', datasetToSave, 'utf8')
            //Log.trace("INSIDE save:  which directory am i in?"  + process.cwd())
            Log.trace("writting files success")

            this.relativePath = process.cwd()
        } catch(e){
            Log.trace("save dataset error" + e.message)
        }
    }



    public isEmpty(myObject: any) {
        for(var key in myObject) {
            if (myObject.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
}