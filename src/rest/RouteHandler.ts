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
import {IInsightFacade, InsightResponse} from "../controller/IInsightFacade";

export default class RouteHandler {

    private static datasetController = new DatasetController();

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
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
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

                let UBCInsight = new InsightFacade();

                UBCInsight.addDataset(id, req.body)


            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }
//add 424(check if on memory)
    public static postQuery(req:restify.Request,res:restify.Response,next:restify.Next){
        Log.trace('RouteHandler::postQuery(..)-params:'+JSON.stringify(req.params));

        try{
            let query:QueryRequest=req.params;
            let UBCInsight = new InsightFacade();

            UBCInsight.performQuery(query)

        }catch(err){
            Log.error('RouteHandler::postQuery(..)-ERROR:'+err);
            res.send(403);
        }
        return next();
    }

    public static deleteQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::deleteQuery(..) - params: ' + JSON.stringify(req.params));
        try {

            var id: string = req.params.id;
            let UBCInsight = new InsightFacade();

            UBCInsight.removeDataset(id)

        } catch (err) {
            Log.error('RouteHandler::deleteQuery(..) - ERROR: dataset with given not found   ' + err.message);
            res.send(404);
        }
    }
}