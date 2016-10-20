/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacade", function () {
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
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should be able to perform a simple query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'courses_avg', WHERE: {"GT": {"courses_avg": 90}}, GROUP: null, APPLY: null, ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform a >90 query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: null, APPLY: null, ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should not be able to perform a null query (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = null;

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });
});