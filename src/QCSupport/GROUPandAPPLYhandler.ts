import QueryController from "../controller/QueryController";
import Log from "../Util";
/**
 * Created by wchan on 2016-10-29.
 */

export default class GAhandler {



    public checkGroupCorrect(group:any,intermediate:any,lastintermediates:any):boolean{
        var validlist:any=[];
        var valid:boolean=true;
        for (var i=0;i< group.length;i++)
        {
            if(intermediate[group[i]]===lastintermediates[i])
            {validlist.push(true);}
            else
            { validlist.push(false);}
        }

        for (var eachValid of validlist) {
            if (eachValid === false)
                valid = false;
        }
        return valid;
    }

    public dealWithGroup(group:Array<string>,intermediate:any,id:string):any{
        var groups:any=[];
        while(intermediate.length!=0)
        {   var sessions:any=[];
            var lastintermediates:any=[];
            var groupvalue:any={};

            for (var a=0;a<group.length;a++)
            {   if (group[a].split("_")[0]!==id)
            {
              //  Log.trace("GROUP is not correct**")
                throw Error;
            }
                var lastintermediate:any;
                lastintermediate=intermediate[0][group[a]];
                lastintermediates.push(lastintermediate);
                groupvalue[group[a]]=intermediate[0][group[a]];
            }
            sessions.push(groupvalue);
            for (var i=0;i<intermediate.length;i++)
            {  if(this.checkGroupCorrect(group,intermediate[i],lastintermediates))
            {   sessions.push(intermediate[i]);
                intermediate.splice(i,1);
                i--;
            }
            }
            groups.push(sessions);
        }
        Log.trace("groups length"+groups.length);
        return groups;
    }

    public dealWithApply(apply:any,grouplist:any,id:string):any {
        var applylist:any=[];

        Log.trace("jump into apply")
        for (var applyobject of apply) {
            var applynewkey=Object.keys(applyobject)[0];//coursesAvg
            var applyvalue=applyobject[Object.keys(applyobject)[0]];
            var applytoken=Object.keys(applyvalue)[0];//AVG
            var applystring:string=applyvalue[Object.keys(applyvalue)[0]];//courses_avg

            if(applystring.split("_")[0]!==id)
            {
                //Log.trace("Apply is not correct**")
                throw Error
            }

            if (applytoken === 'AVG') {
                if(!QueryController.ValidKeyChecker.isvalidNumberKey(applystring))
                    throw Error;
                else
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];

                        var sum: number=0;
                        var length:number=0;
                        for (var j=1;j<sessions.length;j++)
                        {
                            /*if( sessions[j][applystring]!=='undefined'&&
                             sessions[j][applystring]!=null)   */
                            sum+=sessions[j][applystring];
                            length++;
                        }
                        var averageValue: any;
                        averageValue = parseFloat((sum / length).toFixed(2));
                        grouplist[i][0][applynewkey]=averageValue;
                    }
            }

            if (applytoken === 'MIN') {
                if(!QueryController.ValidKeyChecker.isvalidNumberKey(applystring))
                    throw Error;
                else
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var minsession:any=[];
                        var min:number=sessions[1][applystring];
                        for(var j=1;j<sessions.length;j++)
                        {   /*if(sessions[j][applystring]!='undefined'&&
                         sessions[j][applystring]!=null)  */
                            if (sessions[j][applystring]<min)
                                min=sessions[j][applystring]}

                        grouplist[i][0][applynewkey]=min;
                    }
            }

            if (applytoken === 'MAX') {
                if(!QueryController.ValidKeyChecker.isvalidNumberKey(applystring))
                    throw Error;
                else
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var maxsession:any=[];
                        var max:number=sessions[1][applystring];
                        for(var j=1;j<sessions.length;j++)
                        { /* if(sessions[j][applystring]!='undefined'&&
                         sessions[j][applystring]!=null)  */
                            if(sessions[j][applystring]>max)
                                max=sessions[j][applystring]}

                        grouplist[i][0][applynewkey]=max;
                    }
            }


            if (applytoken === 'COUNT') {
                if (QueryController.ValidKeyChecker.isvalidNumberKey(applystring)) {
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var count = 0;
                        var keysession: any = []
                        for (var j = 1; j < sessions.length; j++) {
                            /*   if (sessions[j][applystring] != 'undefined' &&
                             sessions[j][applystring] != null)  */
                            keysession.push(sessions[j][applystring])
                        }
                        if (keysession.length > 1) {
                            keysession.sort();
                            for (var h = 0; h < keysession.length - 1; h++) {
                                if (keysession[h] === keysession[h + 1]) {
                                    keysession.splice(h, 1)
                                    h--;
                                }
                            }
                        }
                        count = keysession.length;
                        grouplist[i][0][applynewkey] = count;
                    }
                }
                else if (QueryController.ValidKeyChecker.isvalidStringKey(applystring)) {
                    for (var i = 0; i < grouplist.length; i++) {
                        var sessions = grouplist[i];
                        var count = 0;
                        var keysession: any = []
                        for (var j = 1; j < sessions.length; j++) {
                            if (sessions[j][applystring] != 'undefined' &&
                                sessions[j][applystring] != null &&
                                sessions[j][applystring].length > 0)
                                keysession.push(sessions[j][applystring])
                        }
                        if (keysession.length > 1) {
                            keysession.sort();
                            for (var h = 0; h < keysession.length - 1; h++) {
                                if (keysession[h] === keysession[h + 1]) {
                                    keysession.splice(h, 1)
                                    h--;
                                }
                            }
                        }
                        count = keysession.length;
                        grouplist[i][0][applynewkey] = count;
                    }
                }
                else
                    throw Error
            }

        }
        for (var i = 0; i < grouplist.length; i++){
            applylist.push(grouplist[i][0]);
        }
        return applylist;
    }
}



