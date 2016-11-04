import QueryController from "../controller/QueryController";
import Log from "../Util";
/**
 * Created by wchan on 2016-10-29.
 */

export default class EBNFParser {

    public parseEBNF(where: any, section: any,id:string) {

        let valid = true;

        if ((typeof where['AND'] == 'undefined')
            && (typeof where['OR'] == 'undefined')
            && (typeof where['GT'] == 'undefined')
            && (typeof where['LT'] == 'undefined')
            && (typeof where['EQ'] == 'undefined')
            && (typeof where['IS'] == 'undefined')
            && (typeof where['NOT'] == 'undefined')) {
            throw Error
        }


        if (typeof where['AND'] !== 'undefined' || typeof where['OR'] !== 'undefined') {
            //  Log.trace("type1!!!")
            if (typeof where['AND'] !== 'undefined') {
                var validList1: any = [];
                for (var ANDfilter of where['AND']) {
                    validList1.push(this.parseEBNF(ANDfilter, section,id));
                }
                for (var eachValid1 of validList1) {
                    if (eachValid1 === false)
                        valid = false;
                }
            }

            if (typeof where['OR'] !== 'undefined') {
                var validList2: any = [];
                for (var ORfilter of where['OR']) {
                    validList2.push(this.parseEBNF(ORfilter, section,id));
                }
                valid = false;
                for (var eachValid2 of validList2) {
                    if (eachValid2 === true) {
                        valid = true
                    }
                }
            }
        }


        if (typeof where['GT'] || typeof where['EQ'] || typeof where['LT'] !== 'undefined') {

            if (typeof where['GT'] !== 'undefined') {

                var whereKey1 = Object.keys(where['GT']).toString()
                var whereValue1 = where['GT'][Object.keys(where['GT'])[0]]

                if (QueryController.ValidKeyChecker.isvalidKey(whereKey1) === false) {
                    throw Error
                };
                if(whereKey1.split("_")[0]!==id)
                {
                  //  Log.trace("GT is not corret **")
                    throw Error
                }
                valid = valid && (section[whereKey1] > whereValue1);
            }

            if (typeof where['EQ'] !== 'undefined') {
                var whereKey2 = Object.keys(where['EQ']).toString()
                var whereValue2 = where['EQ'][Object.keys(where['EQ'])[0]]
                if (QueryController.ValidKeyChecker.isvalidKey(whereKey2) === false) {
                    throw Error
                };

                if(whereKey2.split("_")[0]!==id)
                {
                   // Log.trace("EQ is not corret **")
                    throw Error
                }

                valid = valid && (((section[whereKey2])) === whereValue2);

            }

            if (typeof where['LT'] !== 'undefined') {

                var whereKey3 = Object.keys(where['LT']).toString()
                var whereValue3 = where['LT'][Object.keys(where['LT'])[0]]
                if (QueryController.ValidKeyChecker.isvalidKey(whereKey3) === false) {
                    throw Error
                };

                if(whereKey3.split("_")[0]!==id)
                {
                  //  Log.trace("LT is not correct** ")
                    throw Error
                }

                valid = valid && (section[whereKey3] < whereValue3);

            }
        }

        if (typeof where['IS'] !== 'undefined') {

            var whereKey4 = Object.keys(where['IS']).toString();
            var whereValue4 = where['IS'][Object.keys(where['IS'])[0]];
            if (QueryController.ValidKeyChecker.isvalidKey(whereKey4) === false) {
                throw Error
            };
            if(whereKey4.split("_")[0]!==id)
            {
             //  Log.trace("IS is not correct** ")
                throw Error
            }

            var sectionWhere = section[whereKey4];
            if (sectionWhere !== "") {
                if (whereValue4.substring(0, 1) === "*" && whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    var whereValue4 = whereValue4.split("*").join("");
                    valid = valid && sectionWhere.includes(whereValue4);
                }
                else if (whereValue4.substring(0, 1) === "*") {
                    var whereValue4 = whereValue4.split("*").join("");
                    valid = valid && (sectionWhere.substring(sectionWhere.length - whereValue4.length, sectionWhere.length) === whereValue4)
                }
                else if (whereValue4.substring(whereValue4.length - 1, whereValue4.length) === "*") {
                    var whereValue4 = whereValue4.split("*").join("");
                    valid = valid && (sectionWhere.substring(0, whereValue4.length) === whereValue4)
                }
                else {
                    valid = valid && (sectionWhere === whereValue4);
                }
            }
            else
                valid = false;
        }

        if (typeof where['NOT'] !== 'undefined') {
            valid = valid && (!this.parseEBNF(where['NOT'], section,id));
        }
        return valid;
    }
}
