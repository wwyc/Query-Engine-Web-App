/**
 * Created by wchan on 2016-10-19.
 */

/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest, default as QueryController} from "../src/controller/QueryController";

describe("InsightFacadeQuery", function () {
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



    it("Should not be able to perform a query with non-existing dataset (424)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'courses_avg', WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_avg', AS: "TABLE"};
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        }).catch(function (response: InsightResponse) {
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

    it("Should be able to perform a simple query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'courses_avg', WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform a query finding sections of CPSC310 (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {"GET":["courses_dept","courses_id","courses_avg"],"WHERE":{"AND":[{"IS":{"courses_dept":"cpsc"}},{"IS":{"courses_id":"310"}}]},"AS":"TABLE"};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should not be able to perform query with Where keys referencing an invalid dataset (424)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'courses_avg', WHERE: {"GT": {"abc_avg": 90}}, ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should not be able to perform a query with empty GET Array(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: [], WHERE: {"GT": {"courses_avg": 90}}, AS: 'table'};
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with empty GET String(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: "", WHERE: {"GT": {"courses_avg": 90}}, AS: 'table'};
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

        it("Should not be able to perform a query with GROUP keys without unscore not in APPLY (400)", function () {
     var that = this;
     Log.trace("Starting test: " + that.test.title);
     let query: QueryRequest = {GET: ["courses_avg", "courseAverage"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_avg"], APPLY: [], ORDER: 'courses_avg', AS: 'table'};
     return facade.performQuery(query).then(function (response: InsightResponse) {
         expect.fail('Should not happen');

     }).catch(function (response: InsightResponse) {
         expect(response.code).to.equal(400);

     });
     });

    it("Should not be able to perform a query with same GROUP and APPLY keys (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_id", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_avg", "courses_id"], APPLY: [{"coursesabc":{}},{"courses_id":{}}], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to submit an empty query (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_avg", "courseAverage"], WHERE: null, ORDER: null, AS: null};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("Should not be able to submit an empty GROUP (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = { GET: ["courses_avg", "courseAverage"],
           WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg", "courses_id"],
            APPLY:[], ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("get item without underscore should be in apply (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = { GET: ["courses_avg", "courseAverage"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP:["courses_avg", "courses_id"],APPLY:[{"averagecount": {"COUNT": "courses_avg"}}],
            ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("get item with underscore should be in group (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = { GET: ["courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP:[ "courses_id"],APPLY:[{"averagecount": {"COUNT": "courses_avg"}}],
            ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("get item without underscore should be in Apply (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = { GET: ["averagecount1"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP:[ "courses_id"],APPLY:[{"averagecount": {"COUNT": "courses_avg"}}],
            ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("get item with underscore should be in group (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = { GET: ["courses_avg","averagecount1"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP:[ "courses_id"],APPLY:[{"averagecount": {"COUNT": "courses_avg"}}],
            ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("Should not be able to perform a query without GET (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: null, WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with empty GET (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: [], WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_avg', AS: 'TABLE'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query without AS (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'courses_avg', WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_avg', AS: null};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with ORDER keys not in GET key (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: 'courses_avg', WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_id', AS: "TABLE"};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });





/*    it("Should be able to perform a correct query1 (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            AS:"TABLE"
        }
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });*/



/*    it("Should be able to perform a >90 query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });*/

/*    it("Should be able to perform a query with only GROUP but empty APPLY (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_avg"], APPLY: [], ORDER: 'courses_avg', AS: 'table'};
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');

        });
    });*/


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



    it("Should not be able to perform a query with only APPLY but null GROUP (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: null, APPLY: ["courses_avg"], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only APPLY but empty GROUP (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: [], APPLY: ["courses_avg"], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP but not APPLY (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_avg"], APPLY: null, ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });


    it("Should not be able to perform a query with GROUP keys that are invalid (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["sdfsdf", "courses_id"], APPLY: [], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP keys not in GET Array (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: ["courses_dept", "courses_avg"], WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_dept", "courses_avg", "courses_id"], APPLY: [], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP keys not in GET String (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: "courses_dept", WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_id"], APPLY: [], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GET keys not in GROUP or APPLY  (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {GET: "courses_dept", WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_id"], APPLY: [], ORDER: 'courses_avg', AS: 'table'};

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

        it("Should not be able to perform a query with GET keys not in GROUP or APPLY  (400)", function () {
     var that = this;
     Log.trace("Starting test: " + that.test.title);
     let query: QueryRequest = {GET: ["courses_id", "coursesAverage"],
         WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_id"],
         APPLY: ["coursesSum"], ORDER: 'courses_avg', AS: 'table'};

     return facade.performQuery(query).then(function (response: InsightResponse) {
     expect.fail('Should not happen');
     }).catch(function (response: InsightResponse) {
     expect(response.code).to.equal(400);

     });
     });




    it("Should not be able to perform a query with same APPLY keys (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            APPLY: [{"averagecount": {"COUNT": "courses_avg"}},{"averagecount": {"COUNT": "courses_instructor"}}],
            ORDER: 'courses_avg', AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to perform a query with same APPLY keys22 (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            APPLY: [{"courses_avg": {"COUNT": "courses_avg"}},{"averagecount": {"COUNT": "courses_instructor"}}],
            ORDER: 'courses_avg', AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("EBNF parser1 cover", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "*sc"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("EBNF parser2 cover", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"LT": {"courses_avg": 90}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("EBNF parser3 cover", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("COUNT cover", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": ["courses_id","Averagecount"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"Averagecount": {"COUNT": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("accept empty apply", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_id"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_id" ],
            "APPLY": [],
            "ORDER": { "dir": "DOWN", "keys": ["averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("All keys in GET should be in either GROUP or APPLY.", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_id","courses_avg"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id" ],
            "APPLY": [],
            "ORDER": 'courses_id',
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("All keys in GET without underscore should be in either GROUP or APPLY.", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_id","averageXXX"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_id" ],
            "APPLY": [{"Averagecount": {"COUNT": "courses_avg"}}],
            "ORDER": { "dir": "DOWN", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("accept empty where", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_id"],
            "WHERE": {},
            "GROUP": [ "courses_id" ],
            "APPLY": [{"Averagecount": {"COUNT": "courses_avg"}}],
            "ORDER": { "dir": "DOWN", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {

            expect.fail('Should not happen');
        });
    });



    it("should not be able to accept wrong room name", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest =  {

            "GET": ["rooms_full", "rooms_number"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });


    it("should not be able to accept wrong room name", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest =  {

            "GET": ["rooms_fullname", "rooms_number"],
            "WHERE": {"IS": {"rooms_shorts": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });

    it("should not be able to accept wrong room name", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest =  {

            "GET": ["rooms_fullname", "rooms_number"],
            "WHERE": {"IS": {"rooms_shorts": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["rooms_num"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });
    it("proper room query", function() {
        var that = this;

        Log.trace("Starting test: " + that.test.title);
            let query: QueryRequest= {
                "GET": ["rooms_fullname", "rooms_number","rooms_address","rooms_type","rooms_furniture"
                ,"rooms_href"],
                "WHERE": {"IS": {"rooms_shortname": "DMP"}},
                "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
                "AS": "TABLE"
            };
            return facade.performQuery(query).then(function (response: InsightResponse) {

                expect(response.code).to.equal(200);
            }).catch(function (response: InsightResponse) {

                expect.fail('Should not happen');
            });
        });
    it("All keys in GET without underscore should be in either GROUP or APPLY.3", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_avg"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_id" ],
            "APPLY": [{"Averagecount": {"COUNT": "courses_avg"}}],
            "ORDER": { "dir": "DOWN", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("All keys in GET without underscore should be in either GROUP or APPLY.3", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_avg"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_id" ],
            "APPLY": [{"Averagecount": {"COUNT": "courses_avg"}},{"Averagecount": {"MAX": "courses_avg"}}],
            "ORDER": { "dir": "DOWN", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("All keys in GET without underscore should be in either GROUP or APPLY.3when apply empty", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "courses_id","Averagecount"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_id" ],
            "APPLY": [],
            "ORDER": { "dir": "DOWN", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });
    it("All keys in GET without underscore should be in either GROUP or APPLY.3when apply empty", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            "GET": [ "Averagecount"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_id" ],
            "APPLY": [{"averagecount": {"COUNT": "courses_avg"}}],
            "ORDER": { "dir": "DOWN", "keys": ["Averagecount", "courses_id"]},
            "AS": "TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {

            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


});


