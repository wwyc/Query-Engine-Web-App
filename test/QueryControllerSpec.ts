/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';



var fs = require('fs');
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        // NOTE: this is not actually a valid query for D1
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });


    it ("correct EBNFparser",function(){
        let dataset:any=[{"courses_dept":"epse","courses_avg":97.41},
            {"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"cnps","courses_avg":97.47},
            {"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.48},
            {"courses_dept":"epse","courses_avg":97.69},{"courses_dept":"epse","courses_avg":97.78},
            {"courses_dept":"crwr","courses_avg":98},{"courses_dept":"crwr","courses_avg":98},
            {"courses_dept":"epse","courses_avg":98.08},{"courses_dept":"epse","courses_avg":98.36},
            {"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":98.45},
            {"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.5},
            {"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":98.58},
            {"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":98.58},
            {"courses_dept":"epse","courses_avg":98.7},{"courses_dept":"nurs","courses_avg":98.71},
            {"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"eece","courses_avg":98.75},
            {"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"epse","courses_avg":98.76},{
                "courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.8},
            {"courses_dept":"cnps","courses_avg":99.19},{"courses_dept":"math","courses_avg":99.78},
            {"courses_dept":"math","courses_avg":99.78}];
        let controller = new QueryController(dataset);
     let valid:boolean=controller.parserEBNF(
         {"AND": [
             {"GT": {"courses_avg": 90}},
             {"IS": {"courses_dept": "adhe"}}
         ]},dataset[0]
     )
        expect(valid).to.equal(false)


    });



    /*it("Should be able to query, although the answer will be empty", function () {
     // NOTE: this is not actually a valid query for D1, nor is the result correct.
     let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
     let dataset: Datasets = {};
     let controller = new QueryController(dataset);
     let ret = controller.query(query);
     Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
     expect(ret).not.to.be.equal(null);
     // should check that the value is meaningful
     });*/
     });

/*it("Should be able to validate a valid query", function () {
    // NOTE: greater than 90
    let query: QueryRequest = {
        "GET": ["courses_dept", "courses_avg"],
        "WHERE" : {
            "GT" : {"courses_avg" : 90}
        },
        "ORDER" : "courses_avg",
        "AS" : "TABLE"
    }
    let dataset: Datasets = fs.readFileSync("./310courses.1.0.zip");
    let controller = new QueryController(dataset);
    let isValid = controller.isValid(query);
    let  actual=controller.query(query);
    expect(isValid).to.equal(true);
    expect(actual= "q0.json").to.equal(true) ;
})*/