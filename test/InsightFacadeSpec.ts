/**
 * Created by wchan on 2016-10-17.
 */

/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import QueryController from "../src/controller/QueryController";
import {Datasets, default as DatasetController} from "../src/controller/DatasetController";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacade", function () {

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync('./courses.json');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - id.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    it(" FIRST - Should be able to a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let controller = new DatasetController()
        return controller.process("courses", zipFileContents).then(function(result: Boolean){
            expect(result).to.equal(true)
        }).catch(function(result: Boolean){
            expect.fail('should not happen')
        })
    });

    it(" SECOND - Should not be able to add invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let controller = new DatasetController()
        return controller.process("courses", "sdhfsuhfisud").then(function(result: Boolean){
            expect(result).to.equal(false)
        }).catch(function(result: Boolean){
            expect(result).to.equal(false)

        })
    });

    it(" THIRD - Should not be able to save an invalid dataset ", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let controller = new DatasetController()
        return controller.save("courses", {})
    });

    it("Should be able to a add a new dataset (204)", function () {
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

    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', 'some random bytes').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to delete a non-existing dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should be able to delete an existing dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        facade.addDataset('courses', zipFileContents)
        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });


/*    it("Should be able to validate a perform a valid query ()", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'food', WHERE: {GT: 90}, ORDER: 'food', AS: 'table'};
        facade.addDataset('courses', zipFileContents)
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });*/

});