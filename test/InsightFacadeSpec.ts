/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacadeDataset", function () {
    this.timeout(100000);

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync(process.cwd() + "/data/courses.json");
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - courses.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });
    it("Should be able to remove an existing dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        return facade.removeDataset('courses').then(function (response1: InsightResponse) {
            expect(response1.code).to.equal(204);
        }).catch(function (response1: InsightResponse) {
            expect.fail('Should not happen');
        });


    });

    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(201);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });


    it("Should not be able to remove a dataset that does not exist (404)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync(process.cwd() + "/data/courses.json");
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - courses.json not removed (probably not present)');
        }

        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            Log.trace("testing: dataset does not exist")
            expect(response.code).to.equal(404);
        });
    });

    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', 'some random bytes').then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to add an dataset with invalid ID (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        //var zipFileContents1 = new Buffer(fs.readFileSync('310co.1.0 - ForTestingInvalidDataSet.zip')).toString('base64');


        return facade.addDataset('courses1234', zipFileContents).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to add an dataset with invalid dataset 2 (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        try{
            var zipFileContents1 = new Buffer(fs.readFileSync('file.txt')).toString('base64');
        }
        catch (err){
            Log.warn('DatasetController::process(..) - ERROR: ' + err);
        }

        return facade.addDataset('courses',zipFileContents1).
        then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });


    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Deleting a non-existing dataset should return a 404. (404)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);

        return facade.removeDataset('courses123').then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);
        });
    });
})