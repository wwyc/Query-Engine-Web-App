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

export default class RouteHandler {

    //private static datasetController = new DatasetController();
    //private static UBCInsightFacade = new InsightFacade();


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

                let UBCfascade1 = new InsightFacade()

                return UBCfascade1.addDataset(id, req.body).then(function(response){
                        if (response.code == 204){
                            res.send(204)
                            return next();
                        } else if (response.code == 201){
                            res.send(201);
                            return next();
                        } else if (response.code == 400){
                            res.send(400);
                            return next();
                        }
                    }
                )

            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
            return next();
        }
        return next();
    }
//add 424(check if on memory)
    public static postQuery(req:restify.Request,res:restify.Response,next:restify.Next){
        try{
            Log.trace('RouteHandler::postQuery(..)-params:'+JSON.stringify(req.params));

            let query:QueryRequest=req.params;

            Log.trace(typeof req.params)

            let UBCfacade2 = new InsightFacade()

            return UBCfacade2.performQuery(query).then(function(response){
                if (response.code == 200){
                    res.json(200, response.body);
                    return next();
                } else if (response.code == 424){
                    res.send(424);
                    return next();
                } else if (response.code == 400){
                    res.send(400);
                    return next();
                }
                    }
            )

        }catch(e){
            Log.error('RouteHandler::postQuery(..)-ERROR:'+e.message);
            res.send(403);
            return next();
        }
        //return next();
    }

    public static deleteQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::deleteQuery(..) - params: ' + JSON.stringify(req.params));
        try {

            var id: string = req.params.id;

            let UBCfacade3 = new InsightFacade()
            
            return UBCfacade3.removeDataset(id).then(function(response){
                    if (response.code == 204){
                        res.send(204)
                        return next();
                    }  else if (response.code == 404){
                        res.send(404);
                        return next();
                    }else if (response.code == 400){
                        res.send(400);
                        return next();
                    }
                }
            )

        } catch (err) {
            Log.error('RouteHandler::deleteQuery(..) - ERROR: dataset with given not found   ' + err.message);
            res.send(400);
            return next();
        }
    }
}