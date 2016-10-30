/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import Log from "../src/Util";
import QueryController1 from "../src/controller/QueryController";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest, default as QueryController} from "../src/controller/QueryController";


var fs = require('fs');

describe("QueryController", function () {
            this.timeout(10000);

            var zipFileContents: string = null;
            var facade: InsightFacade = null;
            before(function () {
                Log.info('InsightController::before() - start');
                // this zip might be in a different spot for you
                zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
                try {
                    // what you delete here is going to depend on your impl, just make sure
                    // all of your temporary files and directories are deleted
                    fs.unlinkSync(process.cwd() +  "/data/courses.json");
                } catch (err) {
                    // silently fail, but don't crash; this is fine
                    Log.warn('InsightController::before() - courses.json not removed (probably not present)');
                }
                Log.info('InsightController::before() - done');
            });

            beforeEach(function () {
                facade = new InsightFacade();
            });

/*
    it ("should be able to Find the average for all cpsc courses in up order", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function(response:InsightResponse)
        {

        let query: QueryRequest={
            GET: ["courses_id", "courseAverage"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:'TABLE'
        };
        return facade.performQuery(query).then(function(response:InsightResponse){
        //Log.trace(JSON.stringify(response.body))
            let expectresult=JSON.parse(fs.readFileSync("./test/result/q1.json",'utf8'))
            expect(response.body).to.be.deep.equal(expectresult)
        });
    });
});

    it (" Find the average for all courses in the university, sort up (hardest to easiest)", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function(response:InsightResponse)
        {

            let query: QueryRequest={
                    GET: ["courses_dept", "courses_id", "courseAverage", "maxFail"],
                    WHERE: {},
                    GROUP: [ "courses_dept", "courses_id" ],
                    APPLY: [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
                    ORDER: { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
                    AS:"TABLE"
                };
            return facade.performQuery(query).then(function(response:InsightResponse){
                //Log.trace(JSON.stringify(response.body))
                let expectresult=JSON.parse(fs.readFileSync("./test/result/q2.json",'utf8'))
                expect(response.body).to.be.deep.equal(expectresult)
            });
        });
    });


    it (" Find the average for all courses in the university, sort up (hardest to easiest)", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function(response:InsightResponse)
        {

            let query: QueryRequest={
                GET: ["courses_dept", "courses_id", "numSections"],
                WHERE: {},
                GROUP: [ "courses_dept", "courses_id" ],
                APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
                ORDER: { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
                AS:"TABLE"
            };
            return facade.performQuery(query).then(function(response:InsightResponse){
                //Log.trace(JSON.stringify(response.body))
                let expectresult=JSON.parse(fs.readFileSync("./test/result/q3.json",'utf8'))
                expect(response.body).to.be.deep.equal(expectresult)
            });
        });
    });
*/

});
