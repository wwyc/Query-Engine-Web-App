/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';

describe("DatasetController", function () {
   this.timeout(100000);
    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to receive a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        Log.trace("what is the file path?   " + process.cwd())
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            var fs = require('fs')
            data = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
            return controller.process('courses', data);


        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(true);
        });


    });

    it("Should be able to get a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        Log.trace("what is the file path?   " + process.cwd())
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            controller.getDatasets();

            controller.getDataset('courses');
        })

    });


/*    it("Should be able to delete a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('courses', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(true);
        });



    });*/

    //getDatasets()

    /*it("Should be able to load all Datasets from disk to memory", function () {
        Log.test('Getting dataset');

        var controller = new DatasetController()
        var datasetsRetrieved = controller.getDatasets()

        var fs = require("fs")

        expect(typeof controller.getDataset("courses")).to.equal(typeof fs.readFileSync("../cpsc310project/data/courses.json"));


    });*/

    //getdataset(id:string)

    //should be able to process dataset?

    //processdataset



});
