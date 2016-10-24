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


    it("Should be able to perform a simple query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: 'courses_avg',
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: null,
            APPLY: null,
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform a correct query1 (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            WHERE: {},
            GROUP: ["courses_dept", "courses_id"],
            APPLY: [{"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}}],
            ORDER: {"dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            AS: "TABLE"
        }
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });


    it("Should be able to perform a >90 query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform a query with only GROUP but empty APPLY (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            APPLY: [],
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');

        });
    });

    it("Should not be able to perform a query has key in GET is not in GROUP OR APPLY", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_dept", "courses_id"],
            APPLY: [],
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP without APPLY (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to perform a query with only GROUP without APPLY (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("All keys in GET that are not separated by an underscore should appear in APPLY.", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courseAverage"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_dept"],
            APPLY: [{"courseAverage": {"AVG": "courses_avg"}}], ORDER: 'courses_avg', AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("All keys in GET that are not separated by not in APPLY should report 400.", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "MaxFail"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_dept"],
            APPLY: [{"courseAverage": {"AVG": "courses_avg"}}], ORDER: 'courses_avg', AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

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

    it("Should not be able to perform a query with only APPLY but null GROUP (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: null,
            APPLY: ["courses_avg"],
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only APPLY but empty GROUP (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: [],
            APPLY: ["courses_avg"],
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP but not APPLY (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            APPLY: null,
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });


    it("Should not be able to perform a query with GROUP keys that are all valid (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["sdfsdf", "courses_id"],
            APPLY: [],
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP keys not in GET Array (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_dept", "courses_avg", "courses_id"],
            APPLY: [],
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GROUP keys not in GET String (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: "courses_dept",
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_id"],
            APPLY: [],
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    it("Should not be able to perform a query with only GET keys not in GROUP or APPLY  (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: "courses_dept",
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_id"],
            APPLY: [],
            ORDER: 'courses_avg',
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);

        });
    });

    /*    it("Should not be able to perform a query with GET keys not in GROUP or APPLY  (400)", function () {
     var that = this;
     Log.trace("Starting test: " + that.test.title);
     let query: QueryRequest = {GET: ["courses_id", "coursesAverage"], WHERE: {"GT": {"courses_avg": 90}}, GROUP: ["courses_id"], APPLY: ["coursesSum"], ORDER: 'courses_avg', AS: 'table'};

     return facade.performQuery(query).then(function (response: InsightResponse) {
     expect.fail('Should not happen');
     }).catch(function (response: InsightResponse) {
     expect(response.code).to.equal(400);

     });
     });*/

    it("Should not be able to perform a query with same GROUP and APPLY keys (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg", "courses_id"],
            APPLY: [{"courseAverage": {"AVG": "courses_avg"}}],
            ORDER: 'courses_avg',
            AS: 'table'
        };

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
            APPLY: [{"courses_abc": {}}, {"courses_id": {}}, {"courses_dept": {}}, {"courses_id": {}}],
            ORDER: 'courses_avg', AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("Should not be able to perform a query with same APPLY keys2 (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {"GT": {"courses_avg": 90}},
            GROUP: ["courses_avg"],
            APPLY: [{"courseAverage": {"AVG": "courses_avg"}}, {"courseAverage": {"MAX": "courses_fail"}}],
            ORDER: 'courses_avg', AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("Should be able to perform a correct query3", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_dept", "minFail", "maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept"],
            APPLY: [{"minFail": {"MIN": "courses_fail"}}, {"maxAudit": {"MAX": "courses_audit"}}],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("All keys in GROUP should be presented in GET1", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_dept", "courses_avg", "courses_instructor", "minFail", "maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept", "courses_avg", "courses_instructor"],
            APPLY: [{"minFail": {"MIN": "courses_fail"}}, {"maxAudit": {"MAX": "courses_audit"}}],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it(" All keys in GET should be in either GROUP or APPLY.", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_dept", "courses_avg", "courses_instructor", "courses_fail", "minFail", "maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept", "courses_avg", "courses_instructor"],
            APPLY: [{"minFail": {"MIN": "courses_fail"}}, {"maxAudit": {"MAX": "courses_audit"}}],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("All keys in GROUP should be presented in GET2", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_dept", "courses_avg", "minFail", "maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept", "courses_avg", "courses_instructor"],
            APPLY: [{"minFail": {"MIN": "courses_fail"}}, {"maxAudit": {"MAX": "courses_audit"}}],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("If a key appears in GROUP or in APPLY, it cannot appear in the other one.", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_dept", "courses_avg", "minFail", "maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept", "courses_avg", "courses_instructor"],
            APPLY: [{"minFail": {"MIN": "courses_avg"}}, {"maxAudit": {"MAX": "courses_audit"}}],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });


    it("accept multiple rules of group", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courses_dept", "minFail", "maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept"],
            APPLY: [{"minFail": {"MIN": "courses_avg"}}, {"maxAudit": {"MAX": "courses_audit"}}, {"courseAverage": {"AVG": "courses_avg"}},
                {"instructorCount": {"COUNT": "courses_instructor"}}, {"minPass": {"MIN": "courses_pass"}}
            ],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });


    it("accept empty where", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {

              GET:["courses_dept", "courses_id"],
                  WHERE: {},
            ORDER: { "dir": "UP", "keys": ["courses_dept"]},
            AS:"TABLE"

        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });

    });

    it("accept multiple rules of apply", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["minFail","courses_id", "courses_dept","maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept"],
            APPLY: [{"minFail": {"MIN": "courses_avg"}}, {"maxAudit": {"MAX": "courses_audit"}}, {"courseAverage": {"AVG": "courses_avg"}},
                {"instructorCount": {"COUNT": "courses_instructor"}}, {"minPass": {"MIN": "courses_pass"}}
            ],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });



    it("accept multiple rules of apply", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["minFail","courses_id", "courses_dept","maxAudit"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept"],
            APPLY: [{"minFail": {"MIN": "courses_avg"}},
                {"maxAudit": {"MAX": "courses_audit"}},
                {"courseAverage": {"AVG": "courses_avg"}},
                {"instructorCount": {"COUNT": "courses_instructor"}},
                {"minPass": {"MIN": "courses_pass"}}
            ],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit"]
            },
            AS: 'table'
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("accept multiple rules of apply", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["minFail","courses_id", "courses_dept","maxAudit","instructorCount","minPass"],
            WHERE: {"IS": {"courses_dept": "*c"}},
            GROUP: ["courses_id", "courses_dept"],
            APPLY: [{"minFail": {"MIN": "courses_avg"}},
                {"maxAudit": {"MAX": "courses_audit"}},
                {"courseAverage": {"AVG": "courses_avg"}},
                {"instructorCount": {"COUNT": "courses_instructor"}},
                {"minPass": {"MIN": "courses_pass"}}
            ],
            ORDER: {
                "dir": "UP",
                "keys": ["minFail", "maxAudit","instructorCount"]
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });



});