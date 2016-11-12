/**
 * Created by Alicia on 11/3/16.
 */


import {Datasets} from "../src/controller/DatasetController";
import Log from "../src/Util";

import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest, default as QueryController} from "../src/controller/QueryController";

var fs = require('fs');
describe("RoomsQueryController", function () {
    this.timeout(1000000);

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310rooms.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync(process.cwd() + "/data/rooms.html");
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - rooms.html not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });
    it("find the rooms in DMP", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', zipFileContents).then(function(response:InsightResponse)
        {
            let query: QueryRequest= {
                "GET": ["rooms_fullname", "rooms_number"],
                "WHERE": {"IS": {"rooms_shortname": "DMP"}},
                "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
                "AS": "TABLE"
            };
            return facade.performQuery(query).then(function(response:InsightResponse){
                let expectresult=JSON.parse(fs.readFileSync("./test/result/q6.json",'utf8'))
                expect(response.body).to.be.deep.equal(expectresult)
            });
        });
    });

    it ("count the number of rooms with > 160 seats in each building", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', zipFileContents).then(function(response:InsightResponse)
        {
            let query: QueryRequest= {
                    "GET": ["rooms_shortname", "numRooms"],
                    "WHERE": {"GT": {"rooms_seats": 160}},
                    "GROUP": [ "rooms_shortname" ],
                    "APPLY": [ {"numRooms": {"COUNT": "rooms_name"}} ],
                    "AS": "TABLE"
                };
            return facade.performQuery(query).then(function(response:InsightResponse){
                let expectresult=JSON.parse(fs.readFileSync("./test/result/q7.json",'utf8'))
                expect(response.body).to.be.deep.equal(expectresult)
            });
        });
    });


    it ("list rooms with moveable tables in a bounding box", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', zipFileContents).then(function(response:InsightResponse)
        {
            let query: QueryRequest={
                "GET": ["rooms_fullname", "rooms_number", "rooms_seats"],
                "WHERE": {"AND": [
                    {"GT": {"rooms_lat": 49.261292}},
                    {"LT": {"rooms_lon": -123.245214}},
                    {"LT": {"rooms_lat": 49.262966}},
                    {"GT": {"rooms_lon": -123.249886}},
                    {"IS": {"rooms_furniture": "*Movable Tables*"}}
                ]},
                "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
                "AS": "TABLE"
            } ;
            return facade.performQuery(query).then(function(response:InsightResponse){
                let expectresult=JSON.parse(fs.readFileSync("./test/result/q8.json",'utf8'))
                expect(response.body).to.be.deep.equal(expectresult)
            });
        });
    });


    it("Revolution1: Should not be possible to query multiple datasets at the same time", function () {
        var that = this;
        let query: QueryRequest = {
            GET: ["rooms_fullname", "courses_id"],
            WHERE: {
                IS: {"rooms_number": "2365"}
            },
            ORDER: {"dir": "UP", "keys": ["rooms_number"]},
            AS: "TABLE"
        };
        return facade.performQuery(query).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });


    it("Revolution2: Should not be possible to query multiple datasets at the same time", function () {
        var that = this;
        let query: QueryRequest = {
            GET: ["rooms_fullname", "rooms_number"],
            WHERE: {
                IS: {"courses_avg": 23}
            },
            ORDER: {"dir": "UP", "keys": ["rooms_number"]},
            AS: "TABLE"
        };
        return facade.performQuery(query).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });



});
