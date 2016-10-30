/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import InsightFacade from "../controller/InsightFacade";
import {InsightResponse} from "../controller/IInsightFacade";

export default class RouteHandler {

    //private static datasetController = new DatasetController();
    private static UBCInsightFacade = new InsightFacade();


    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::putDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                return RouteHandler.UBCInsightFacade.addDataset(id, req.body).then(function(response: InsightResponse){
                        if (response.code == 204){
                            res.send(204)
                            Log.trace('RouteHandler::putDataset(..) : 204 SUCCESS added new Dataset');
                            next();
                        } else if (response.code == 201){
                            res.send(201);
                            Log.trace('RouteHandler::putDataset(..) : 201 SUCCESS updated existing Dataset');
                            next();
                        } else if (response.code == 400){
                            Log.trace('RouteHandler::putDataset(..) : 400 FAILED');
                            res.send(400);
                            next();
                        }
                    }
                ).catch(function(err:Error){
                    Log.trace('RouteHandler::putDataset(..) : ERROR' + err.message);
                    res.json(400, {err:err.message});
                    next();
                })

            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.json(400, {err: err.message});
            return next();
        }
        //return next();
    }
//add 424(check if on memory)
    public static postQuery(req:restify.Request,res:restify.Response,next:restify.Next){
        try{
            Log.trace('RouteHandler::postQuery(..)-params:'+JSON.stringify(req.params));

            let query:QueryRequest=req.params;

            return RouteHandler.UBCInsightFacade.performQuery(query).then(function(response: InsightResponse){
                if (response.code == 200){
                    res.json(200, response.body);
                     //next();
                } else if (response.code == 424){
                    res.json(424, {missing: ['courses']});
                    //next();
                } else {
                    Log.error('RouteHandler::postQuery(..)-ERROR: 400');
                    res.json(400, {error: "Invalid Query"});
                }
                next();
                    }).catch(function(err:Error){
                Log.error('RouteHandler::postQuery(..)-ERROR:'+err.message);
                res.json(400, {error: "Invalid Query"});
                next();
            })

        }catch(err){
            Log.error('RouteHandler::postQuery(..)-ERROR:'+err.message);
            res.json(400, {error: "Invalid Query"});
            next();
        }
        //return next();
    }

    public static deleteQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::deleteQuery(..) - params: ' + JSON.stringify(req.params));
        try {

            var id: string = req.params.id;

            return RouteHandler.UBCInsightFacade.removeDataset(id).then(function(response: InsightResponse){
                    if (response.code == 204){
                        Log.error('RouteHandler::deleteQuery(..) - SUCCESS:');
                        res.send(204)
                        next();
                    }  else if (response.code == 404){
                        Log.error('RouteHandler::deleteQuery(..) - FAILED 404 :');
                        res.send(404);
                        next();
                    }else if (response.code == 400){
                        Log.error('RouteHandler::deleteQuery(..) - FAILED 400 :');
                        res.send(404);
                        next();
                    }
                }). catch(function(err:Error){
                Log.error('RouteHandler::deleteQuery(..) - ERROR:' + err.message);
                res.send(404);
                return next();
            })
        } catch (err) {
            Log.error('RouteHandler::deleteQuery(..) - ERROR:' + err.message);
            res.send(400);
            return next();
        }
    }
}