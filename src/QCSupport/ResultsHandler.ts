/**
 * Created by wchan on 2016-10-29.
 */

export default class ResultsHandler {

    /**
     * Find the value from each section given key in GET
     * @returns object for final result{[id: string: {}} returns empty if nothing was found
     */
    public represent(GETInput: any, sectionArray: any) {

        //Log.trace("what is type of getArray:"  + Array.isArray(getArray))
        var resultArray: any = []

// Check to see if GET is string or Array
        if (typeof GETInput === 'string') {
            for (var sectionX of sectionArray) {
                var resultObj: any = {}
                resultObj[GETInput] = sectionX[GETInput]
                resultArray.push(resultObj)
            }
        }
        else if (Array.isArray(GETInput)) {

            for (var eachSection of sectionArray) {
                var resultObj1: any = {}
                for (var j = 0; j < Object.keys(GETInput).length; j++) {
                    var key = GETInput[j]
                    resultObj1[key] = eachSection[key];
                }
                resultArray.push(resultObj1)
            }
        }
        return resultArray;

    }

    public sortArray(resultArray: any, order: any) {
        // Log.trace("INSIDE sorting!")
        resultArray.sort(function (a: any, b: any) {
            if (typeof order == "string") {
                //orderkey is a string
                var value1 = a[order];
                //Log.trace("value1  " + value1)
                var value2 = b[order];
                if (value1 < value2) {
                    return -1;
                }
                if (value1 > value2) {
                    return 1;
                }
                return 0;

            }

            else if (typeof order == "object"){
                var orderkey: any = order['keys'];//orderkey is an array
                var i = 0;
                if (order['dir'] === 'UP')// lowers come first
                {
                    while (i < orderkey.length) {
                        var value1 = a[orderkey[i]];
                        var value2 = b[orderkey[i]];
                        //    Log.trace("value1,2up"+value1+ value2)
                        if (value1 < value2) {
                            return -1;
                        }
                        if (value1 > value2) {
                            return 1;
                        }
                        else
                            i++;
                    }
                    return 0;
                }

                if (order['dir'] === 'DOWN') {
                    while (i < orderkey.length) {
                        var value1 = a[orderkey[i]];
                        var value2 = b[orderkey[i]];
                        //   Log.trace("value1,2down"+value1+ value2)
                        if (value1 < value2) {
                            return 1;
                        }
                        if (value1 > value2) {
                            return -1;
                        }
                        else
                            i++;
                    }
                    return 0;
                }
            }
        });
        return resultArray;
    }




}