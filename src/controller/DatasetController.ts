/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import forEach = require("core-js/fn/array/for-each");
import Session from '../DataStorage';

import {error} from "util";
import {ASTNode} from "parse5";
import {TreeAdapter} from "parse5";
import {treeAdapters} from "parse5";
import Room from "../DataStorageRooms";
import Room2 from "../DataStorageR";
import {IncomingMessage} from "http";
import ValidKeyChecker from "../QCSupport/ValidKeyChecker";
var http = require('http')
var parse5 = require('parse5');



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
    public static ValidKeyChecker = new ValidKeyChecker();


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

        // check if dataset/memory is empty
        if (!(this.isEmpty(this.datasets[id]) || (typeof this.datasets[id] === "undefined")||this.datasets[id]===null)){

            Log.trace("dataset is in memory")
            return this.datasets[id];
          /*  var keys = Object.keys(this.datasets);
            for (var id1 of keys) {
                Log.trace(id1);
                if (id === id1){
                    return this.datasets[id];
                }
            }   */

        }  else {

            //check if dataset is in disk
            var fs = require('fs');
            this.relativePath = process.cwd()
            Log.trace("inside getdataset("+id+")"  + this.relativePath + "/data/" +id+ ".json")


            try {var data = fs.readFileSync(this.relativePath + "/data/" + id + ".json")
                Log.trace("dataset is in disk")
            }
            catch (err){
                Log.trace("inside getDataset:  dataset with given id:  "  + id+ " - Not Found")
                return null;
            }

            this.datasets[id] = JSON.parse(data);
            }

        return this.datasets[id];
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

        let that = this;

        Log.trace("this.datasets - is it empty?:  " + this.isEmpty(this.datasets))

        if (this.isEmpty(this.datasets)|| (typeof this.datasets === "undefined")) {
            //check if datasets in memory is empty
            var fs1 = require('fs');
            //read directory and return files (array of file names)

            that.relativePath = process.cwd()

            Log.trace(that.relativePath)

            var Files=(fs1.readdirSync(that.relativePath+"/data/"))
         Log.trace("files length"+Files.length)
            for(var file of Files){
                var fileName=file.split(".")[0]
                Log.trace("fileName"+fileName)
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
                    //var stringPromiseIndex : any

                    var promiseArray:any = []

                    zip.forEach(function (Path: string, file: JSZipObject){
                        if (file.dir){
                            //Log.trace("iterating over" + Path)
                             if (Path.includes(id))
                             {isValidDataset = true}
                             //Log.trace("is dataset valid?  " + isValidDataset)
                   }
                        if (!file.dir) {
                        if (id == "rooms"){
                            if (file.name.includes("index.htm")){
                                Log.trace("found html file!!!!!")
                                stringPromise = file.async("string") // string from JSZipObject?
                                promiseArray.push(stringPromise)
                        }
                        } else {
                                stringPromise = file.async("string") // string from JSZipObject?
                                promiseArray.push(stringPromise)
                            }
                        }
                    })

                    var validBuildingShortNameArray: any = []

                    Promise.all(promiseArray).then(function(endResult: any) {

                        Log.trace("INSIDE PROMISE ALL")

                        if (id == "rooms") {
                            var document = parse5.parse(endResult.toString(), { treeAdapter: parse5.treeAdapters.default });
                            validBuildingShortNameArray = that.getValidBuildingShortNamesArray(document)
                            Log.trace("validBuildingShortNameArray length    " + validBuildingShortNameArray.length)

                            //Log.trace ("ACU in ARRAY???????       "  + DatasetController.ValidKeyChecker.contains("ACU", validBuildingShortNameArray).toString())

                            var stringPromise1: any
                            var promiseArray1:any = []
                            zip.forEach(function (Path: string, file: JSZipObject){
                                if (!file.dir) {

                                    var arrayfile = file.name.split("/")
                                    var lengthArray = arrayfile.length
                                    //Log.trace("what is arrayfile?    "  + arrayfile.length)
                                    var lastFileName = arrayfile[lengthArray-1]
                                    var isValidBuilding = false
                                    for (var shortName of validBuildingShortNameArray){
                                        if (shortName == lastFileName){
                                            isValidBuilding = true
                                        }
                                    }

                                    //Log.trace("what is last file name?    "  + lastFileName)
                                    //Log.trace("true or false???    "  + isValidBuilding.toString())

                                    if (isValidBuilding){
                                        stringPromise1 = file.async("string") // string from JSZipObject?
                                        promiseArray1.push(stringPromise1)
                                        }
                                }
                            })

                            let BuildingMap: any = {}

                            Log.trace("what is promiseArray1 length    "  + promiseArray1.length)


                            Promise.all(promiseArray1).then(function(endResult: any) {


                                Log.trace("inside PROMISE.ALL #2")

                                // Loop through each building file
                                for (var objs of endResult) {

                                    var eachBuildingRoomsArray: any = []
                                    var roomLat: any = 0
                                var roomLon: any = 0

                                    var document1 = parse5.parse(objs.toString(), {treeAdapter: parse5.treeAdapters.default});
                                var BIOLChildNode = parse5.treeAdapters.default.getChildNodes(document1)
                                var BIOLhtmlChildNode = BIOLChildNode[6]
                                var BIOLhtmlChildNodeBody = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNode)[3]
                                var BIOLhtmlChildNodeBodyChild31 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBody)[31]
                                var BIOLhtmlChildNodeBodyChild10 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild31)[10]

                                    // Building UCLL has a different location for name of building
                                    if  (parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild10).length <3) {
                                        BIOLhtmlChildNodeBodyChild10 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild31)[12]
                                    }

                                        var BIOLhtmlChildNodeBodyChild1 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild10)[1]
                                        var BIOLhtmlChildNodeBodyChild3 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild1)[3]
                                        var BIOLhtmlChildNodeBodyChild1a = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild3)[1]

                                    //find long name
                                        var BIOL1 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild1a)[3]
                                        var BIOL2 = parse5.treeAdapters.default.getChildNodes(BIOL1)[1]
                                        var BIOL3 = parse5.treeAdapters.default.getChildNodes(BIOL2)[1]
                                        var BIOL4 = parse5.treeAdapters.default.getChildNodes(BIOL3)[1]
                                        var BIOL5 = parse5.treeAdapters.default.getChildNodes(BIOL4)[1]
                                        var BIOL5 = parse5.treeAdapters.default.getChildNodes(BIOL5)[0]
                                        var BIOL6 = parse5.treeAdapters.default.getChildNodes(BIOL5)[0]
                                        var LongName = BIOL6.value
                                        Log.trace("what is the building 2 " + LongName)

                                //  Look for room table / check if there are rooms in this building

                                var BIOLhtmlChildNodeBodyChild5 = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild1a)[5]
                                var BIOLhtmlChildNodeBodyChild1b = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild5)[1]

                                if (parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild1b).length > 2) {
                                    Log.trace( " there are rooms in this building")
                                    var BIOLhtmlChildNodeBodyChild3b = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild1b)[3]
                                    var BIOLhtmlTableNodes = parse5.treeAdapters.default.getChildNodes(BIOLhtmlChildNodeBodyChild3b)

                                    //find room address
                                    var BIOL7 = parse5.treeAdapters.default.getChildNodes(BIOL4)[3]
                                    var BIOL8 = parse5.treeAdapters.default.getChildNodes(BIOL7)[0]
                                    var BIOL9 = parse5.treeAdapters.default.getChildNodes(BIOL8)[0]
                                    var roomAddress = BIOL9.value

                                    var BIOLrowNode = BIOLhtmlTableNodes[1]
                                    var BIOLrowChildNodes3 = parse5.treeAdapters.default.getChildNodes(BIOLrowNode)[3]

                                    //  Loop through room table
                                    var ArrayofRoomRows = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3)

                                    for (var i = 1; i < ArrayofRoomRows.length; i++) {
                                        //Log.trace ("inside ArrayofRoomRows Loop START")

                                        // create a new room for each row
                                        var Room: any = new Room2()
                                        //Log.trace("new room created!!")

                                        //find room number
                                        var BIOLrowChildNodes3ChildNodeRoomRows = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3)[i]
                                        var BIOLrowChildNodes3ChildNode1a = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNodeRoomRows)[1]
                                        var BIOLrowChildNodes3ChildNode1b = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNode1a)[1]
                                        var BIOLrowChildNodes3ChildNode0 = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNode1b)[0]
                                        var roomNumber = BIOLrowChildNodes3ChildNode0.value
                                        //Log.trace ("inside ArrayofRoomRows Loop     " + roomNumber)

                                        //find room href
                                        var roomhref = parse5.treeAdapters.default.getAttrList(BIOLrowChildNodes3ChildNode1b)[0].value

                                        //find room seats
                                        var BIOLrowChildNodes3ChildNode3a = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNodeRoomRows)[3]
                                        var BIOLrowChildNodes3ChildNode3a0 = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNode3a)[0]
                                        var roomCapacity = BIOLrowChildNodes3ChildNode3a0.value.trim()

                                        //find room furniture
                                        var BIOLrowChildNodes3ChildNode5 = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNodeRoomRows)[5]
                                        var BIOLrowChildNodes3ChildNode50 = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNode5)[0]
                                        var roomFurniture = BIOLrowChildNodes3ChildNode50.value.trim()

                                        //find room type
                                        var BIOLrowChildNodes3ChildNode7 = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNodeRoomRows)[7]
                                        var BIOLrowChildNodes3ChildNode70 = parse5.treeAdapters.default.getChildNodes(BIOLrowChildNodes3ChildNode7)[0]
                                        var roomType = BIOLrowChildNodes3ChildNode70.value.trim()

                                        // create room Address in %20 for getLatLon
                                        var Array = roomhref.split("/")
                                        var Length = Array.length
                                        var LastItem = Array[Length - 1]
                                        var Short = LastItem.split("-")[0]

                                        var addressURL = that.getAddressURL(roomAddress)

                                        Room.rooms_number = roomNumber
                                        Room.rooms_seats = parseInt(roomCapacity)
                                        Room.rooms_furniture = roomFurniture
                                        Room.rooms_type = roomType
                                        Room.rooms_shortname = Short
                                        Room.rooms_name = Room.rooms_shortname + "_" + Room.rooms_number
                                        Room.rooms_href = roomhref
                                        Room.rooms_fullname = LongName
                                        Room.rooms_address = roomAddress

/*                                        Log.trace("This room is in building:     "   + Room.rooms_shortname)
                                        Log.trace(Room.rooms_fullname)
                                        Log.trace(Room.rooms_name)
                                        Log.trace(Room.rooms_seats)
                                        Log.trace(Room.rooms_type)
                                        Log.trace(Room.rooms_number)
                                        Log.trace(Room.rooms_furniture)
                                        Log.trace(Room.rooms_address)
                                        Log.trace(Room.rooms_href)*/

                                        eachBuildingRoomsArray.push(Room)


                                        i++
                                    }

                                    Log.trace("how many rooms in BuildingroomArray?  last 3 " + eachBuildingRoomsArray.length)


                                    that.getLatLon("http://skaha.cs.ubc.ca:8022/api/v1/team34/" + addressURL).then(function (latlon: any) {
                                        //Log.trace("inside getLatLon.then")
                                        roomLat = latlon.lat
                                        roomLon = latlon.lon
                                        for (var room of eachBuildingRoomsArray) {
                                            room.rooms_lat = roomLat
                                            room.rooms_lon = roomLon
                                        }



                                    }).catch(function (err: Error) {
                                        Log.trace('then error    ' + err.message);
                                    })
                                    BuildingMap[Short] = eachBuildingRoomsArray


                                }

                                }

                                Log.trace("BuildingMapKeys   FIRST  "  + Object.keys(BuildingMap).toString())

                                processedDataset = BuildingMap
                                that.save(id, processedDataset)
                                Log.trace("process dataset...rooms dataset saved")
                                fulfill(true)

                            }). catch (function (err) {
                                Log.error('DatasetController::process(..) - Promise #2 ERROR: ' + err.message);
                                reject(false);
                            });

                            Log.trace("BuildingMapKeys   LAST  "  + Object.keys(BuildingMap).toString())



                            //Log.trace("how many rooms in BuildingroomArray?  last "  + eachBuildingRoomsArray.length)

                            //Log.trace(Object.keys(BuildingMap).toString())


                        }





                        else if (id == "courses") {
                            let courseMap = that.courseMapCreator(endResult)
                        processedDataset = courseMap
                            that.save(id, processedDataset)
                            Log.trace("process dataset...courses dataset saved")
                            fulfill(true)
                        }

                    }). catch (function (err) {
                        Log.error('DatasetController::process(..) - Promise ERROR: ' + err.message);
                        reject(false);
                    });

                    if (isValidDataset == false){
                        reject(false)
                        throw Error
                    }

                }).catch(function (err) {
                    Log.error('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(false);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(false);
            }
        })


    }


    public courseMapCreator(endResult: any) {

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
                    session.courses_uuid=obj["id"].toString();
                    sessions.push(session)
                }
            }
            if (typeof sessions !== "undefined") {
                courseMap[session.courses_dept + session.courses_id] = sessions
            }
        }
        return courseMap
    }


    public save(id: string, processedDataset: any) {
        // add it to the memory model
        this.datasets[id] = processedDataset;

        // TODO: actually write to disk in the ./data directory

        var fs2 = require('fs');

        var datasetToSave = JSON.stringify(processedDataset);

        try {
            fs2.writeFileSync('data/' + id + '.json', datasetToSave, 'utf8')
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

    public getLatLon(httpAddress: any): Promise<String> {
        return new Promise(function (fulfill, reject) {
            let parsedData: any
            try {
                http.get(httpAddress, function (data: IncomingMessage) {
                    //Log.trace("inside Latlon")
                    data.setEncoding('utf8')
                    let rawData = '';
                    data.on('data', (chunk: any) => rawData += chunk);
                    data.on('end', () => {
                        try {
                            parsedData = JSON.parse(rawData);
                            return fulfill(parsedData)
                        } catch (e) {
                            console.log(e.message);
                            return reject (e.message)
                        }
                    })
                })
            } catch (err){
                Log.trace("inside latlon error      "  + err.message)
            }
        })}

    public getAddressURL(roomAddress: any) {

        var addressForGetLatLon = ""
        var addressArray = roomAddress.split(" ")
        for (var string of addressArray){
            addressForGetLatLon = addressForGetLatLon + string + "%20"
        }
        var length1 = addressForGetLatLon.length
        var addressForGetLatLonFinal = addressForGetLatLon.substring(0, length1-3 )

        return addressForGetLatLonFinal;
    }

    public getValidBuildingShortNamesArray(document: any){

        var validBuildingShortNameArray: any = []

        //var parse5 = require ("parse5")
        var ChildNode = parse5.treeAdapters.default.getChildNodes(document)
        var htmlChildNode = parse5.treeAdapters.default.getChildNodes(document)[6]
        var htmlChildNodeBody = parse5.treeAdapters.default.getChildNodes(htmlChildNode)[3]
        var htmlChildNodeBodyChild31 = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBody)[31]
        var htmlChildNodeBodyChild10 = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild31)[10]
        var htmlChildNodeBodyChild1 = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild10)[1]
        var htmlChildNodeBodyChild3 = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild1)[3]
        var htmlChildNodeBodyChild1a = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild3)[1]
        var htmlChildNodeBodyChild5 = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild1a)[5]
        var htmlChildNodeBodyChild1b = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild5)[1]
        var htmlChildNodeBodyChild3b = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild1b)[3]
        var htmlTableNodes = parse5.treeAdapters.default.getChildNodes(htmlChildNodeBodyChild3b)

        //var htmlTableNodes = that.gethtmlTableNodes(document)
        for (var i = 1; i < htmlTableNodes.length; i++){
            //Log.trace("what is i   " + i.toString())
            var rowNode = htmlTableNodes[i]
            var rowChildNodes3 = parse5.treeAdapters.default.getChildNodes(rowNode)[3]
            var rowChildNodes3ChildNode0 = parse5.treeAdapters.default.getChildNodes(rowChildNodes3)[0]

            var shortName = rowChildNodes3ChildNode0.value.trim()
            validBuildingShortNameArray.push(shortName)
            //Log.trace("ValidBuildingShortNameArray length    " + validBuildingShortNameArray.length)
            i++
        }

        return validBuildingShortNameArray
    }
    }

