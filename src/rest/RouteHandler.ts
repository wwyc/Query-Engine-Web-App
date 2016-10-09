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

                let controller = RouteHandler.datasetController;

                controller.process(id, req.body).then(function (result) {

                    if (controller.getDatasets()[id] == null){
                        // Dataset is not in disk
                        res.json(204, {success:result})
                        Log.trace("dataset with this ID is new")

                    } else {
                        res.json(201, {success: result});
                        Log.trace("dataset with this ID already exists!")
                    }

                }).catch(function (err: Error) {
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                    res.json(400, {err: err.message});
                });
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

            let datasets:Datasets=RouteHandler.datasetController.getDatasets();

            Log.trace("RouteHandler-whatisinDatasets?"+Object.keys(RouteHandler.datasetController.getDatasets()))

            let controller=new QueryController(datasets);
            let isValid=controller.isValid(query);

            var GETKey=query.GET;
            var id:string

            if(isValid===true){

                if(typeof GETKey==='string'&&GETKey.includes("_")){
                    id=GETKey.split("_")[0];
                }else if(Array.isArray(GETKey)&&GETKey[0].includes("_")){
                    id=GETKey[0].split("_")[0];
                }
//checkifdatasetwithidexists
                Log.trace(id)

                if(typeof datasets[id]=='undefined'){
                    Log.error('RouteHandler::postQuery(..)-ERROR:'+'datasetnotfound');
                    res.json(424,{missing:[id]});
                }
                else{
//datasetwithidexits
//callqueryfunctionandreturnresultsorcatcherror
                    try{
                        let result=controller.query(query);
                        res.json(200,result);
                        Log.trace('RouteHandler::postQuery(..)-:'+'querysuccess');

                    }catch(err){
                        Log.error('RouteHandler::postQuery(..)-ERROR:'+'errorcaughtinquery()...invalidquery');
                        res.json(400,{status:'invalidquery'});
                    }
                }
            }else{
//throwerrorifIsValid=false
                Log.error('RouteHandler::postQuery(..)-ERROR:'+'isValid=false...invalidquery');
                res.json(400,{status:'invalidquery'});
            }
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

            var datasetToDelete = RouteHandler.datasetController.getDataset(id)

            if (!(RouteHandler.datasetController.isEmpty(datasetToDelete) || (datasetToDelete == null))){

                //  check if dataset is empty in memory or disk
                delete RouteHandler.datasetController.getDatasets()[id];

                Log.trace("what is relativePath  " + RouteHandler.datasetController.relativePath)
                fs.unlinkSync(RouteHandler.datasetController.relativePath + "/data/" + id+".json")


                Log.trace('RouteHandler::deleteQuery(..) - successful');
                res.json(204, {success: 'dataset deleted'});

                //res.send(204).json({success: 'dataset deleted'});
                //res.send(204);


            } else {
                // produce error if not found in both memory or disk
                throw Error}

        } catch (err) {
            Log.error('RouteHandler::deleteQuery(..) - ERROR: dataset with given not found   ' + err.message);
            res.send(404);
        }
    }
}