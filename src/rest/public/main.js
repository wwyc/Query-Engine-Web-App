
$(function () {
    $("#datasetAdd").click(function () {
        var id = $("#datasetId").val();
        var zip = $("#datasetZip").prop('files')[0];
        var data = new FormData();
        data.append("zip", zip);
        $.ajax("/dataset/" + id,
            {
                type: "PUT",
                data: data,
                processData: false
            }).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $("#datasetRm").click(function () {
        var id = $("#datasetId").val();
        $.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });


    jQuery("#queryForm1").submit(function (e) {
        e.preventDefault();//don't want to refresh the entire page
        var query1;
        var buildingname = jQuery("#buildingname").val().trim()
        var roomnumber = jQuery("#roomnumber").val().trim()
        var roomsize = jQuery("#roomsize").val().trim();
        var roomtype = jQuery("#roomtype").val().trim();
        var furnituretype = jQuery("#furnituretype").val().trim();
        var choosebuilding = jQuery("#choosebuilding").val()
        var distance = jQuery("#distance").val()
        var roomsizecompare = jQuery("#roomsizecompare").val();
        var orderdirection = jQuery("#direction1").val();
        //   var roomcomparison=jQuery("#roomcomparison").val();

        var buildingname1=jQuery("#buildingname1").val().trim();
        var distance1=jQuery("#roomdistance").val().trim();

        var roomrfilteresult = [];
        $("input:checkbox[name=getroomfilter]:checked").each(function () {
            roomrfilteresult.push($(this).val());
        });
        var buildingquery;
        var furniturequery;
        var typequery;
        if (roomrfilteresult.length === 1 && roomrfilteresult[0] === "rooms_shortname") {
            buildingquery = {"IS": {"rooms_shortname": buildingname}};
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname"],
                "WHERE": buildingquery,
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });
        }

        else if (roomrfilteresult.length === 1 && roomrfilteresult[0] === "rooms_seats") {
            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname"],
                "WHERE": roomsizecompare,
                "ORDER": {"dir": orderdirection, "keys": ["rooms_seats"]},
                "AS": "TABLE"
            });
        }
        else if (roomrfilteresult.length === 1 && roomrfilteresult[0] === "rooms_type") {

            typequery = {"IS": {"rooms_type": roomtype}};
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname"],
                "WHERE": typequery,
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });


        }

        else if (roomrfilteresult.length === 1 && roomrfilteresult[0] === "rooms_furniture") {

            furniturequery = {"IS": {"rooms_furniture": furnituretype}};
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname"],
                "WHERE": furniturequery,
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });


        }


        else if (roomrfilteresult.length === 2 && roomrfilteresult[0] === "rooms_type" &&
            roomrfilteresult[1] === "rooms_furniture") {
            typequery = {
                "OR": [{"IS": {"rooms_furniture": furnituretype}}
                    , {"IS": {"rooms_type": roomtype}}]
            }
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": typequery,
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }


        else if (roomrfilteresult.length === 2 && roomrfilteresult[0] === "rooms_shortname" &&
            roomrfilteresult[1] === "rooms_seats") {
            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [roomsizecompare,{"IS": {"rooms_shortname": buildingname}}]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }

        else if (roomrfilteresult.length === 2 && roomrfilteresult[0] === "rooms_shortname" &&
            roomrfilteresult[1] === "rooms_type") {

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ {"IS": {"rooms_type": roomtype}},{"IS": {"rooms_shortname": buildingname}}]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }
        else if (roomrfilteresult.length === 2 && roomrfilteresult[0] === "rooms_shortname" &&
            roomrfilteresult[1] === "rooms_furniture") {
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ {"IS": {"rooms_furniture": furnituretype}},{"IS": {"rooms_shortname": buildingname}}]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }
        else if (roomrfilteresult.length === 2 && roomrfilteresult[0] === "rooms_seats" &&
            roomrfilteresult[1] === "rooms_type") {
            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ {"IS": {"rooms_type": roomtype}},roomsizecompare]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }
      else if (roomrfilteresult.length === 2 && roomrfilteresult[0] === "rooms_seats" &&
            roomrfilteresult[1] === "rooms_furniture") {
            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};
            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ {"IS": {"rooms_furniture": furnituretype}},roomsizecompare]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }

        else if (roomrfilteresult.length === 3 && !roomrfilteresult.includes("rooms_shortname")) {
            typequery = {
                "OR": [{"IS": {"rooms_furniture": furnituretype}}
                    , {"IS": {"rooms_type": roomtype}}]
            }
            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ typequery,roomsizecompare]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }
        else if (roomrfilteresult.length === 3 && !roomrfilteresult.includes("rooms_seats")) {
            typequery = {
                "OR": [{"IS": {"rooms_furniture": furnituretype}}
                    , {"IS": {"rooms_type": roomtype}}]},

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ typequery,{"IS": {"rooms_shortname": buildingname}}]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }

        else if (roomrfilteresult.length === 3 && !roomrfilteresult.includes("rooms_type")) {

            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};


                query1 = JSON.stringify({
                    "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                        "rooms_furniture", "rooms_type"],
                    "WHERE": {
                        "AND": [ {"IS": {"rooms_furniture": furnituretype}},{"IS": {"rooms_shortname": buildingname}},roomsizecompare]
                    },
                    "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                    "AS": "TABLE"
                });

        }
        else if (roomrfilteresult.length === 3 && !roomrfilteresult.includes("rooms_furniture")) {
            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ {"IS": {"rooms_type": roomtype}},{"IS": {"rooms_shortname": buildingname}},roomsizecompare]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }

        else if (roomrfilteresult.length === 4) {
            typequery = {
                "OR": [{"IS": {"rooms_furniture": furnituretype}}
                    , {"IS": {"rooms_type": roomtype}}]
            }


            if (roomsizecompare === "GT")
                roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "EQ")
                roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
            else if (roomsizecompare === "LT")
                roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};

            query1 = JSON.stringify({
                "GET": ["rooms_name", "rooms_shortname", "rooms_fullname",
                    "rooms_furniture", "rooms_type"],
                "WHERE": {
                    "AND": [ typequery,{"IS": {"rooms_shortname": buildingname}},roomsizecompare]
                },
                "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                "AS": "TABLE"
            });

        }



        /*
         http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
         */
        function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = (lat2-lat1)* (Math.PI/180);
            var dLon = (lon2-lon1)* (Math.PI/180);
            var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos((lat1)* (Math.PI/180)) * Math.cos((lat2)*(Math.PI/180)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d*1000;
        }

        //room distance

        function method1() {
            return $.ajax("/query", {type:"POST",
                data: givenbuildingquery, contentType: "application/json", dataType: "json"}
            );
        }

        function method2() {
            console.log(allbuildingquery)
            return $.ajax("/query", {type:"POST",
                data: allbuildingquery, contentType: "application/json", dataType: "json"}
            );
        }


        function filterbuilding(data1,data2){
            var givenbuildinglat=data1[0]["result"][0]["buildingLat"]
            console.log(givenbuildinglat)
            var givenbuildinglon=data1[0]["result"][0]["buildingLon"]
            console.log(givenbuildinglon)
            var buildinglist=data2[0]["result"]
            for(var i=0;i<buildinglist.length;i++)
            {  var realdistance=getDistanceFromLatLon(givenbuildinglat,givenbuildinglon,buildinglist[i]["rooms_lat"],
                buildinglist[i]["rooms_lon"])
                if(realdistance>distance1)
                {
                    buildinglist.splice(i,1);
                    i--;
                }
                else {
                    buildinglist[i]["realdistance(meter)"] = Math.ceil(realdistance)
                }

            }
            console.log("building length"+buildinglist.length)
            buildinglist.sort(function (a, b) {


                //orderkey is a string
                var value1 = a["realdistance(meter)"];
                //Log.trace("value1  " + value1)
                var value2 = b["realdistance(meter)"];
                if (value1 < value2) {
                    return -1;
                }
                if (value1 > value2) {
                    return 1;
                }
                return 0;

            });

            generateTable(buildinglist);

        }



        if (!roomrfilteresult.includes("roomsdistance")) {
            try {
                console.log("##### printing the query #####");
                console.log(orderdirection);
                console.log(roomrfilteresult);
                console.log(query1);
                console.log(buildingname);
                console.log(roomsize);
                $.ajax("/query", {
                    type: "POST",
                    data: query1,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (data) {
                        if (data["render"] == "TABLE" || "table") {
                            generateTable(data["result"]);
                        }
                    }
                }).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            } catch (err) {
                spawnErrorModal("Query Error", err);
            }
        }





        else {




                console.log("jump to distnace")
            var buildingquery={"IS": {"rooms_shortname": buildingname1}};

            var givenbuildingquery = JSON.stringify({
                "GET": ["rooms_shortname", "buildingLat", "buildingLon"],
                "WHERE": buildingquery,
                "GROUP": ["rooms_shortname"],
                "APPLY": [{"buildingLat": {"AVG": "rooms_lat"}}, {"buildingLon": {"AVG": "rooms_lon"}}],
                "AS": "TABLE"
            })
            var allbuildingquery;
           if(roomrfilteresult.length===1) {

               allbuildingquery = JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": {},
                   "AS": "TABLE"
               });
           }
            else if(roomrfilteresult.length===2&&roomrfilteresult.includes("rooms_seats")) {
               if (roomsizecompare === "GT")
                   roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "EQ")
                   roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "LT")
                   roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};

               allbuildingquery = JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": roomsizecompare,
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_seats"]},
                   "AS": "TABLE"
               });
            }

           else if(roomrfilteresult.length===2&&roomrfilteresult.includes("rooms_type")) {


               typequery = {"IS": {"rooms_type": roomtype}};
              allbuildingquery= JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": typequery,
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                   "AS": "TABLE"
               });

           }
           else if(roomrfilteresult.length===2&&roomrfilteresult.includes("rooms_furniture")) {


               furniturequery = {"IS": {"rooms_furniture": furnituretype}};
               allbuildingquery= JSON.stringify({
                   "GET": ["rooms_name","rooms_lat", "rooms_lon"],
                   "WHERE": furniturequery,
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_shortname"]},
                   "AS": "TABLE"
               });
           }


           else if(roomrfilteresult.length===3&&!roomrfilteresult.includes("rooms_seats"))
           {

             allbuildingquery = JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": {
                       "OR": [{"IS": {"rooms_furniture": furnituretype}}
                           , {"IS": {"rooms_type": roomtype}}]
                   },
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_seats"]},
                   "AS": "TABLE"
               });

           }
           else if(roomrfilteresult.length===3&&!roomrfilteresult.includes("rooms_type"))
           {
               if (roomsizecompare === "GT")
                   roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "EQ")
                   roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "LT")
                   roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};
               allbuildingquery = JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": {
                       "AND": [{"IS": {"rooms_furniture": furnituretype}}
                           , roomsizecompare]
                   },
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_seats"]},
                   "AS": "TABLE"
               });

           }

           else if(roomrfilteresult.length===3&&!roomrfilteresult.includes("rooms_furniture"))
           {
               if (roomsizecompare === "GT")
                   roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "EQ")
                   roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "LT")
                   roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};
               allbuildingquery = JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": {
                       "AND": [{"IS": {"rooms_type": roomtype}}
                           , roomsizecompare]
                   },
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_seats"]},
                   "AS": "TABLE"
               });

           }
           else if(roomrfilteresult.length===4)
           {

               if (roomsizecompare === "GT")
                   roomsizecompare = {"GT": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "EQ")
                   roomsizecompare = {"EQ": {"rooms_seats": parseInt(roomsize)}};
               else if (roomsizecompare === "LT")
                   roomsizecompare = {"LT": {"rooms_seats": parseInt(roomsize)}};
               typequery = {
                   "OR": [{"IS": {"rooms_furniture": furnituretype}}
                       , {"IS": {"rooms_type": roomtype}}]
               }
               allbuildingquery = JSON.stringify({
                   "GET": ["rooms_name", "rooms_lat", "rooms_lon"],
                   "WHERE": {
                       "AND": [{"IS": {"rooms_type": roomtype}}
                           , roomsizecompare,typequery]
                   },
                   "ORDER": {"dir": orderdirection, "keys": ["rooms_seats"]},
                   "AS": "TABLE"
               });

           }

            try {
                $.when(method1(), method2()).then(filterbuilding).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            }
            catch (err) {
                spawnErrorModal("Query Error", err);
            }
        }
    });


    jQuery("#sectionexplorer").submit(function (e) {
        e.preventDefault();
        var query;
        var department=jQuery("#department").val()
        var coursenumber=jQuery("#coursenumber").val().trim()
        var instructor=jQuery("#instructor").val()
        var instructorquery;
        var departmentquery;
        var coursenumberquery;

        var filterresult=[];
        $("input:checkbox[name=getsection]:checked").each(function(){
            filterresult.push($(this).val());
        });
        if(filterresult.length===1&&filterresult[0]==="courses_dept")
        {
            departmentquery={"IS": {"courses_dept": department}};
             query=JSON.stringify({
                "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                "WHERE":departmentquery,
                "ORDER": { "dir": "UP", "keys": ["courses_dept","courses_id"]},
                "AS":"TABLE"})
            }
            else if(filterresult.length===1&&filterresult[0]==="courses_instructor")
        {
            instructorquery={"IS": {"courses_instructor": instructor}};
            query=JSON.stringify({
                "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                "WHERE":instructorquery,
                "ORDER": { "dir": "UP", "keys": ["courses_dept","courses_id"]},
                "AS":"TABLE"})
        }
        else if(filterresult.length===1&&filterresult[0]==="courses_size")
        {
            coursenumberquery={"IS": {"courses_id": coursenumber}};
            query=JSON.stringify({
                "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                "WHERE":coursenumberquery,
                "ORDER": { "dir": "UP", "keys": ["courses_dept","courses_id"]},
                "AS":"TABLE"})
        }
        else if(filterresult.length===2&&filterresult[0]==="courses_dept")
        {
            if(filterresult[1]==="courses_instructor")
            {
                instructorquery={"IS": {"courses_instructor": instructor}};
                departmentquery={"IS": {"courses_dept": department}};
                query=JSON.stringify({
                    "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                    "WHERE":{"AND":[instructorquery,departmentquery]},
                    "ORDER": { "dir": "UP", "keys": ["courses_dept","courses_id"]},
                    "AS":"TABLE"})
            }
           else if(filterresult[1]==="courses_id") {
                coursenumberquery = {"IS": {"courses_id": coursenumber}};
                departmentquery = {"IS": {"courses_dept": department}};
                query = JSON.stringify({
                    "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                    "WHERE": {"AND": [coursenumberquery, departmentquery]},
                    "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id"]},
                    "AS": "TABLE"
                })
            }
        }
        else if(filterresult.length===2&&filterresult[0]==="courses_instructor")
        {

            coursenumberquery = {"IS": {"courses_id": coursenumber}};
            instructorquery={"IS": {"courses_instructor": instructor}};
            query = JSON.stringify({
                "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                "WHERE": {"AND": [coursenumberquery, instructorquery]},
                "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id"]},
                "AS": "TABLE"
            })
        }


            else if(filterresult.length===3)
            {    departmentquery={"IS": {"courses_dept": department}};
                coursenumberquery = {"IS": {"courses_id": coursenumber}};
                instructorquery={"IS": {"courses_instructor": instructor}};
                query = JSON.stringify({
                    "GET": ["courses_dept", "courses_id","courses_uuid","courses_title","courses_avg"],
                    "WHERE": {"AND": [coursenumberquery, instructorquery,departmentquery]},
                    "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id"]},
                    "AS": "TABLE"
                })
            }


        try {
            console.log("#### printing the query ####");
            // console.log(sectionsizecompare);
            console.log(departmentquery);
            console.log(instructor);
            console.log(filterresult);

            //console.log("result1"+coursedeptresult[0]);
            //console.log("result1"+coursedeptresult[1]);
            console.log(query);

            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] == "TABLE"||"table") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }


    })


    jQuery("#courseexplore").submit(function (e) {
        e.preventDefault();//don't want to refresh the entire page
       var query;
       var sectionsize=jQuery("#sectionsize").val().trim();
       var department=jQuery("#department1").val()
     //  var instructor=jQuery("#instructor").val().trim();
       // console.log(instructor)
       var title=jQuery("#title").val().trim();
       var sectionsizecompare=$("#sectionsizecompare").val();
     //  var coursenumbercompare=jQuery("#coursenumbercompare").val()
       var orderdirection1=jQuery("#direction0").val();
       var coursecomparison=jQuery("#coursecomparison").val();
       var departmentquery;
     //  var instructorquery;
       var filterresult=[];
       $("input:checkbox[name=getcourse]:checked").each(function(){
           filterresult.push($(this).val());
       });
       var coursedeptresult=[];
       $("input:checkbox[name=getcoursebydept]:checked").each(function(){
           coursedeptresult.push($(this).val());
       });
     var sectioncomparequery;


       if(filterresult.length===1&&filterresult[0]==="courses_dept")
       {
           departmentquery={"IS": {"courses_dept": department}};

           if(coursedeptresult!=null&&coursedeptresult.length>0) {
               if (coursedeptresult.length === 1) {
                   query = JSON.stringify({
                       "GET": ["courses_dept", "courses_id", "AvgPass"],
                       "WHERE": departmentquery,
                       "GROUP": ["courses_dept", "courses_id"],
                       "APPLY": [{"AvgPass": {"AVG": coursedeptresult[0]}}],
                       "ORDER": {"dir": orderdirection1, "keys": ["AvgPass"]},
                       "AS": "TABLE"
                   })
               }


               else if (coursedeptresult.length === 2) {
                   console.log("jump to 2");
                   query = JSON.stringify({
                       "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing"],
                       "WHERE": departmentquery,
                       "GROUP": ["courses_dept", "courses_id"],
                       "APPLY": [{"AvgPass": {"AVG": coursedeptresult[0]}}, {"AvgFailing": {"AVG": coursedeptresult[1]}}],
                       "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing"]},
                       "AS": "TABLE"
                   })
               }
               else if (coursedeptresult.length === 3) {
                   query = JSON.stringify({
                       "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
                       "WHERE": departmentquery,
                       "GROUP": ["courses_dept", "courses_id"],
                       "APPLY": [{"AvgPass": {"AVG": coursedeptresult[0]}},
                           {"AvgFailing": {"AVG": coursedeptresult[1]}}, {"AvgGrade": {"AVG": coursedeptresult[2]}}],
                       "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
                       "AS": "TABLE"
                   })
               }
           }
           else
               query=JSON.stringify({
                   "GET": ["courses_dept", "courses_id","AvgPass","AvgFailing","AvgGrade"],
                   "WHERE":departmentquery,
                   "GROUP": ["courses_dept","courses_id" ],
                   "APPLY": [ {"AvgPass": {"AVG": "courses_pass"}},
                       {"AvgFailing": {"AVG":"courses_fail"}},{"AvgGrade": {"AVG":"courses_avg" }}],
                   "AS":"TABLE"})
       }




 /*
  else if(filterresult.length===2&&filterresult[0]==="courses_dept"&& filterresult[1]==="courses_id")
       {

           query=JSON.stringify({
               "GET": ["courses_dept", "courses_id","courses_avg","courses_fail","courses_pass"],
               "WHERE":{"AND":[{"IS": {"courses_id": coursenumber}},{"IS": {"courses_dept": department}}]},
               "ORDER": { "dir": orderdirection1, "keys": ["courses_id","courses_dept"]},
               "AS":"TABLE"})


       }

   else if(filterresult.length===1&&filterresult[0]==="courses_instructor")
       {
           instructorquery={"IS": {"courses_instructor": instructor}};
           query=JSON.stringify({
               "GET": ["courses_dept", "courses_id","courses_uuid","courses_avg","courses_pass"],
               "WHERE":instructorquery,
               "ORDER": { "dir": orderdirection1, "keys":["courses_id"]},
               "AS":"TABLE"})
       }*/
       else if (filterresult.length===1&&filterresult[0]==="courses_title"){
           query = JSON.stringify({
               "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
               "WHERE": {"IS": {"courses_title": title}},
               "GROUP": ["courses_dept", "courses_id"],
               "APPLY": [{"AvgPass": {"AVG": "courses_pass"}},
                   {"AvgFailing": {"AVG": "courses_fail"}}, {"AvgGrade": {"AVG": "courses_avg"}}],
               "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
               "AS": "TABLE"
           })

       }
       else if (filterresult.length===1&&filterresult[0]==="courses_size"){
           if(sectionsizecompare==="GT")
               sectionsizecompare={"GT":{"courses_size":parseInt(sectionsize)}};
           else if    (sectionsizecompare==="EQ")
               sectionsizecompare={"EQ":{"courses_size":parseInt(sectionsize)}};
           else if    (sectionsizecompare==="LT")
               sectionsizecompare={"LT":{"courses_size":parseInt( sectionsize)}};

           query = JSON.stringify({
               "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
               "WHERE": sectionsizecompare,
               "GROUP": ["courses_dept", "courses_id"],
               "APPLY": [{"AvgPass": {"AVG": "courses_pass"}},
                   {"AvgFailing": {"AVG": "courses_fail"}}, {"AvgGrade": {"AVG": "courses_avg"}}],
               "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
               "AS": "TABLE"
           })

       }

       else if (filterresult.length===2)
       {
        if(filterresult[0]==="courses_dept")
        {

            if(filterresult[1]==="courses_title") {
                query = JSON.stringify({
                    "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
                    "WHERE": {"AND":[{"IS": {"courses_dept": department}}
                    ,{"IS": {"courses_title": title}}]},
                    "GROUP": ["courses_dept", "courses_id"],
                    "APPLY": [{"AvgPass": {"AVG": "courses_pass"}},
                        {"AvgFailing": {"AVG": "courses_fail"}}, {"AvgGrade": {"AVG": "courses_avg"}}],
                    "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
                    "AS": "TABLE"
                })
            }
            else if (filterresult[1]==="courses_size"){
                if(sectionsizecompare==="GT")
                    sectionsizecompare={"GT":{"courses_size":parseInt(sectionsize)}};
                else if    (sectionsizecompare==="EQ")
                    sectionsizecompare={"EQ":{"courses_size":parseInt(sectionsize)}};
                else if    (sectionsizecompare==="LT")
                    sectionsizecompare={"LT":{"courses_size":parseInt( sectionsize)}};

                query = JSON.stringify({
                    "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
                    "WHERE":  {"AND":[{"IS": {"courses_dept": department}}
                        ,sectionsizecompare]},
                    "GROUP": ["courses_dept", "courses_id"],
                    "APPLY": [{"AvgPass": {"AVG": "courses_pass"}},
                        {"AvgFailing": {"AVG": "courses_fail"}}, {"AvgGrade": {"AVG": "courses_avg"}}],
                    "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
                    "AS": "TABLE"
                })

            }

        }
else if (filterresult[0]==="courses_title") {
            if(sectionsizecompare==="GT")
                sectionsizecompare={"GT":{"courses_size":parseInt(sectionsize)}};
            else if    (sectionsizecompare==="EQ")
                sectionsizecompare={"EQ":{"courses_size":parseInt(sectionsize)}};
            else if    (sectionsizecompare==="LT")
                sectionsizecompare={"LT":{"courses_size":parseInt( sectionsize)}};

            query = JSON.stringify({
                "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
                "WHERE":   {"AND":[{"IS": {"courses_title": title}}
                    ,sectionsizecompare]},
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": [{"AvgPass": {"AVG": "courses_pass"}},
                    {"AvgFailing": {"AVG": "courses_fail"}}, {"AvgGrade": {"AVG": "courses_avg"}}],
                "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
                "AS": "TABLE"
            })

        }
       }

else if(filterresult.length===3)
       {
           if(sectionsizecompare==="GT")
               sectionsizecompare={"GT":{"courses_size":parseInt(sectionsize)}};
           else if    (sectionsizecompare==="EQ")
               sectionsizecompare={"EQ":{"courses_size":parseInt(sectionsize)}};
           else if    (sectionsizecompare==="LT")
               sectionsizecompare={"LT":{"courses_size":parseInt( sectionsize)}};

           query = JSON.stringify({
               "GET": ["courses_dept", "courses_id", "AvgPass", "AvgFailing", "AvgGrade"],
               "WHERE":   {"AND":[{"IS": {"courses_dept": department}},{"IS": {"courses_title": title}}
                   ,sectionsizecompare]},
               "GROUP": ["courses_dept", "courses_id"],
               "APPLY": [{"AvgPass": {"AVG": "courses_pass"}},
                   {"AvgFailing": {"AVG": "courses_fail"}}, {"AvgGrade": {"AVG": "courses_avg"}}],
               "ORDER": {"dir": orderdirection1, "keys": ["AvgPass", "AvgFailing", "AvgGrade"]},
               "AS": "TABLE"
           })


       }

   try {
            console.log("#### printing the query ####");
           // console.log(sectionsizecompare);
            console.log(departmentquery);
            console.log(instructor);
            console.log(filterresult);
            console.log(coursedeptresult.length);
            console.log("result1"+coursedeptresult[0]);
            console.log("result1"+coursedeptresult[1]);
            console.log(query);

            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] == "TABLE"||"table") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });






    jQuery("#schedulingformbylist").submit(function(e) {
        e.preventDefault();
        var roomlist = jQuery("#roomlist").val().trim();
        var courselist = jQuery("#courselist").val().trim();
//calculate section number , group course key
//同一节课不同section放在同一个room不同时间
//coursequery need apply
        var roomquery;
        var coursequery;
        console.log("roomlist"+roomlist.length)
        console.log("courselist"+courselist.length)

          var roomarray1 = roomlist.split(',')
          console.log(roomarray1)
          var coursearray1 = courselist.split(',')
          console.log(coursearray1)
          var roomwhere = {"OR": []};
          for (var a = 0; a < roomarray1.length; a++) {
              roomwhere["OR"][a] = {"IS": {"rooms_name": roomarray1[a]}}
          }
          console.log(roomwhere)

          var coursewhere = {"OR": []};
          for (var a = 0; a < coursearray1.length; a++) {
              coursewhere["OR"][a] = {"IS": {"courses_name": coursearray1[a]}}
          }
          console.log(coursewhere)

          roomquery = JSON.stringify({
              "GET": ["rooms_shortname", "rooms_number", "rooms_seats"],
              "WHERE": roomwhere,
              "ORDER": {"dir": "UP", "keys": ["rooms_seats"]},
              "AS": "TABLE"
          })
          console.log(roomquery)
          coursequery = JSON.stringify({
              GET: ["courses_dept", "courses_id", "Sectionnumber", "Coursesize"],
              WHERE: {
                  "AND": [coursewhere,
                      {"IS": {"courses_year": "2014"}}]
              },
              GROUP: ["courses_dept", "courses_id"],
              APPLY: [{"Sectionnumber": {"COUNT": "courses_uuid"}}, {"Coursesize": {"MAX": "courses_size"}}],
              ORDER: {"dir": "UP", "keys": ["Coursesize", "courses_dept", "courses_id",]},
              AS: "TABLE"
          })
          console.log(coursequery)


        function method1() {
            return $.ajax("/query", {type:"POST",
                data: roomquery, contentType: "application/json", dataType: "json"}
            );
        }

        function method2() {
            return $.ajax("/query", {type:"POST",
                data: coursequery, contentType: "application/json", dataType: "json"}
            );
        }

          try{

              $.when(method1(),method2()).then(arrangedata).fail(function(e){
                  spawnHttpErrorModal(e)
              });}
          catch (err) {
              spawnErrorModal("Query Error", err);
          }});





    jQuery("#schedulingformbykeys").submit(function(e) {
        e.preventDefault();
        console.log("jump to else")
        var department2 = jQuery("#coursedept").val().trim()
        var buildingname2 = jQuery("#buildingname2").val().trim()
        var roomarray1 = buildingname2.split(',')
        console.log(roomarray1)
        var coursearray1 = department2.split(',')
        console.log(coursearray1)
        var roomwhere = {"OR": []};
        for (var a = 0; a < roomarray1.length; a++) {
            roomwhere["OR"][a] = {"IS": {"rooms_shortname": roomarray1[a]}}
        }
        console.log(roomwhere)

        var coursewhere = {"OR": []};
        for (var a = 0; a < coursearray1.length; a++) {
            coursewhere["OR"][a] = {"IS": {"courses_dept": coursearray1[a]}}
        }


        var coursequery = JSON.stringify({
            GET: ["courses_dept", "courses_id", "Sectionnumber", "Coursesize"],
            WHERE: {
                "AND": [coursewhere,
                    {"IS": {"courses_year": "2014"}}]
            },
            GROUP: ["courses_dept", "courses_id"],
            APPLY: [{"Sectionnumber": {"COUNT": "courses_uuid"}}, {"Coursesize": {"MAX": "courses_size"}}],
            ORDER: {"dir": "UP", "keys": ["Coursesize", "courses_dept", "courses_id",]},
            AS: "TABLE"
        })
        var roomquery = JSON.stringify({
            "GET": ["rooms_shortname", "rooms_number", "rooms_seats"],
            "WHERE": roomwhere,
            "ORDER": {"dir": "UP", "keys": ["rooms_seats"]},
            "AS": "TABLE"
        })


        function method1() {
            return $.ajax("/query", {type:"POST",
                data: roomquery, contentType: "application/json", dataType: "json"}
            );
        }

        function method2() {
            return $.ajax("/query", {type:"POST",
                data: coursequery, contentType: "application/json", dataType: "json"}
            );
        }

        try{

            $.when(method1(),method2()).then(arrangedata).fail(function(e){
                spawnHttpErrorModal(e)
            });}
        catch (err) {
            spawnErrorModal("Query Error", err);
        }


    });

    jQuery("#schedulingformbykey").submit(function(e) {
        e.preventDefault();
        console.log("jump to else")
        var department = jQuery("#coursedept1").val()
        var buildingname = jQuery("#buildingname3").val()




        var coursequery = JSON.stringify({
            GET: ["courses_dept", "courses_id", "Sectionnumber", "Coursesize"],
            WHERE: {
                "AND": [{"IS":{"courses_dept":department}},
                    {"IS": {"courses_year": "2014"}}]
            },
            GROUP: ["courses_dept", "courses_id"],
            APPLY: [{"Sectionnumber": {"COUNT": "courses_uuid"}}, {"Coursesize": {"MAX": "courses_size"}}],
            ORDER: {"dir": "UP", "keys": ["Coursesize", "courses_dept", "courses_id",]},
            AS: "TABLE"
        })
        var roomquery = JSON.stringify({
            "GET": ["rooms_shortname", "rooms_number", "rooms_seats"],
            "WHERE": {"IS":{"rooms_shortname":buildingname}},
            "ORDER": {"dir": "UP", "keys": ["rooms_seats"]},
            "AS": "TABLE"
        })


        function method1() {
            return $.ajax("/query", {type:"POST",
                data: roomquery, contentType: "application/json", dataType: "json"}
            );
        }

        function method2() {
            return $.ajax("/query", {type:"POST",
                data: coursequery, contentType: "application/json", dataType: "json"}
            );
        }

        try{

            $.when(method1(),method2()).then(arrangedata).fail(function(e){
                spawnHttpErrorModal(e)
            });}
        catch (err) {
            spawnErrorModal("Query Error", err);
        }


    });

        function arrangedata(data1, data2) {
          //  console.log(data2[0]["result"][0]["Sectionnumber"])
           // console.log(data2[0]["result"][0]["Coursesize"])
            //console.log(data1[0]["result"][0]["rooms_seats"])
            alert(JSON.stringify(data1[0]["result"]));//room
            alert(JSON.stringify(data2[0]["result"]));//course

//attribute timetable here
          //  sectionnumber /3 round
            var roomarray = data1[0]["result"];
            var coursearray = data2[0]["result"];
            console.log(roomarray[0]["rooms_fullname"])
            var timetablearr = [];
            var distributedsection = 0;
            var coursecount = 0
            var leftslot = 11
            var leftsection = 0
            var badcourse=0;
            var rowmaintain=0
         //   var badcoursearr=[]
            for (var i = 0; i < coursearray.length; i++) {
                //  sectionnumber /3 round
                distributedsection += Math.ceil(coursearray[i]["Sectionnumber"]/3)
                console.log("distributed"+distributedsection)
            }
            for(var c=0;c<roomarray.length;c++){

                roomarray[c]["leftslot"]=15
              //  console.log(JSON.stringify( roomarray[c]))
            }
            for(var d=0;d<coursearray.length;d++){
                  var value=Math.ceil(coursearray[d]["Sectionnumber"]/3)
                 coursearray[d]["leftsection"]=value
                console.log(JSON.stringify( coursearray[d]))
            }
            console.log("coursearray length"+coursearray.length)

              for (var x = 0; x < coursearray.length; x++) {

                    for (var y = rowmaintain; y < roomarray.length; y++)
                    {

                        if (coursearray[x]["Coursesize"] <= roomarray[y]["rooms_seats"])

                        { if(roomarray[y]["leftslot"]===15) {
                            console.log("case 1: leftslot 11"+coursearray[x]["leftsection"])
                            console.log("y :"+y)
                            if (coursearray[x]["leftsection"] >= 15) {
                                badcourse += coursearray[x]["leftsection"] - 15;
                               /* for(var b=0;b<coursearray[x]["Sectionnumber"] - 11;b++)
                                {
                                    badcoursearr.push(coursearray[x])
                                }
                                */
                                console.log("badcourse"+badcourse)
                                timetablearr[y]=[]
                                for(var i=0;i<coursearray[x]["leftsection"];i++)
                                {
                                    timetablearr[y].push(coursearray[x])
                                coursecount++;
                                }

                                rowmaintain = y + 1;
                                roomarray[y]["leftslot"]=0
                                coursearray[x]["leftsection"]=0
                                break;
                            }
                            else {
                                timetablearr[y]=[]
                                for(var i=0;i<coursearray[x]["leftsection"];i++)
                                {timetablearr[y].push(coursearray[x])
                                coursecount++
                                }
                                rowmaintain = y;
                                roomarray[y]["leftslot"] =  roomarray[y]["leftslot"]- coursearray[x]["leftsection"]
                                coursearray[x]["leftsection"]=0
                                break;
                            }
                        }

                        else if(coursearray[x]["leftsection"]< roomarray[y]["leftslot"]){
                           // console.log("case 2: undersize"+coursearray[x]["leftsection"])
                            //console.log("y :"+y)
                            //console.log(coursearray[x])
                            //console.log("leftslot"+ roomarray[y]["leftslot"])
                            for(var i=0;i<coursearray[x]["leftsection"];i++)
                            {     console.log(coursearray[x])
                                timetablearr[y].push(coursearray[x])
                                coursecount++
                            }   //push

                            rowmaintain = y;
                            roomarray[y]["leftslot"] =  roomarray[y]["leftslot"]- coursearray[x]["leftsection"]
                            coursearray[x]["leftsection"]= 0
                           // console.log("leftslot"+roomarray[y]["leftslot"])
                            //console.log("what happends here")
                            break;
                        }

                    else if(coursearray[x]["leftsection"]===roomarray[y]["leftslot"]){
                            console.log("case 2: samesize"+coursearray[x]["leftsection"])
                            console.log("y :"+y)
                            console.log(coursearray[x])
                            console.log("leftslot"+roomarray[y]["leftslot"])
                            for(var i=0;i<coursearray[x]["leftsection"];i++)
                            {     console.log(coursearray[x])
                                timetablearr[y].push(coursearray[x])
                                coursecount++
                            }   //push

                            rowmaintain = y+1;
                            roomarray[y]["leftslot"] =  0
                            coursearray[x]["leftsection"]= 0
                            console.log("what happends here")
                           break;
                        }

                        else if(coursearray[x]["leftsection"]>roomarray[y]["leftslot"]){
                            console.log("case 3: oversize")
                            console.log("y :"+y)
                            console.log("leftslot"+roomarray[y]["leftslot"])
                           if(leftsection<=15)
                           {
                               console.log("case 3: oversize1"+coursearray[x]["leftsection"])
                               console.log("y :"+y)
                               for(var i=0;i<roomarray[y]["leftslot"];i++)
                               {
                                   timetablearr[y].push(coursearray[x])
                                   coursecount++
                               }
                               coursearray[x]["leftsection"]=coursearray[x]["leftsection"]-roomarray[y]["leftslot"]
                               roomarray[y]["leftslot"] =  0
                               console.log("leftsection"+coursearray[x]["leftsection"])
                        }

                         else{
                               console.log("case 3: oversize2"+coursearray[x]["leftsection"])
                               console.log("y :"+y)
                               for(var i=0;i<roomarray[y]["leftslot"];i++)
                               {timetablearr[y].push(coursearray[x])
                               coursecount++
                               }
                               coursearray[x]["leftsection"]= 15-roomarray[y]["leftslot"]
                               roomarray[y]["leftslot"] =  0

                            }
                        }

                        }

                    }

                    console.log("badcourse"+badcourse)
                    console.log("y"+y+"timetablearr"+JSON.stringify(timetablearr[y]))
                }
            badcourse+=distributedsection-coursecount
   console.log("badcourse"+badcourse)
   console.log(timetablearr);

           var newtimetablearr=[]
            var quality=1-(badcourse/distributedsection)
            alert("schedule quality: "+quality)
            console.log("schedule quality: "+quality)
            for(var j=0;j<timetablearr.length;j++)
            {
               console.log("jump in");
                if(timetablearr[j]!=null&&timetablearr[j]!=undefined&&timetablearr[j].length>0&&
                timetablearr[j]!="") {
                    newtimetablearr[j] = {};
                    if (timetablearr[j][0] != null || timetablearr[j][0] != undefined)
                        newtimetablearr[j]["MWF8am-9am"] = JSON.stringify(timetablearr[j][0]["courses_dept"] + timetablearr[j][0]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][1] != null || timetablearr[j][1] != undefined)
                        newtimetablearr[j]["MWF9am-10am"] = JSON.stringify(timetablearr[j][1]["courses_dept"] + timetablearr[j][1]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][2] != null || timetablearr[j][2] != undefined)
                        newtimetablearr[j]["MWF10am-11am"] = JSON.stringify(timetablearr[j][2]["courses_dept"] + timetablearr[j][2]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][3] != null || timetablearr[j][3] != undefined)
                        newtimetablearr[j]["MWF11am-12pm"] = JSON.stringify(timetablearr[j][3]["courses_dept"] + timetablearr[j][3]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][4] != null || timetablearr[j][4] != undefined)
                        newtimetablearr[j]["MWF12pm-1pm"] = JSON.stringify(timetablearr[j][4]["courses_dept"] + timetablearr[j][4]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][5] != null || timetablearr[j][5] != undefined)
                        newtimetablearr[j]["MWF1pm-2pm"] = JSON.stringify(timetablearr[j][5]["courses_dept"] + timetablearr[j][5]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][6] != null || timetablearr[j][6] != undefined)
                        newtimetablearr[j]["MWF2pm-3pm"] = JSON.stringify(timetablearr[j][6]["courses_dept"] + timetablearr[j][6]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][7] != null || timetablearr[j][7] != undefined)
                        newtimetablearr[j]["MWF3pm-4pm"] = JSON.stringify(timetablearr[j][7]["courses_dept"] + timetablearr[j][7]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][8] != null || timetablearr[j][8] != undefined)
                        newtimetablearr[j]["MWF4pm-5pm"] = JSON.stringify(timetablearr[j][8]["courses_dept"] + timetablearr[j][8]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][9] != null || timetablearr[j][9] != undefined)
                        newtimetablearr[j]["TUTH8am-9:30am"] = JSON.stringify(timetablearr[j][9]["courses_dept"] + timetablearr[j][9]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][10] != null || timetablearr[j][10] != undefined)
                        newtimetablearr[j]["TUTH9:30am-11:00am"] = JSON.stringify(timetablearr[j][10]["courses_dept"] + timetablearr[j][10]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][11] != null || timetablearr[j][11] != undefined)
                        newtimetablearr[j]["TUTH11:00am-12:30pm"] = JSON.stringify(timetablearr[j][11]["courses_dept"] + timetablearr[j][11]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][12] != null || timetablearr[j][12] != undefined)
                        newtimetablearr[j]["TUTH12:30pm-2:00pm"] = JSON.stringify(timetablearr[j][12]["courses_dept"] + timetablearr[j][12]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][13] != null || timetablearr[j][13] != undefined)
                        newtimetablearr[j]["TUTH2:00pm-3:30pm"] = JSON.stringify(timetablearr[j][13]["courses_dept"] + timetablearr[j][13]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                    if (timetablearr[j][14] != null || timetablearr[j][14] != undefined)
                        newtimetablearr[j]["TUTH3:30pm-5:00pm"] = JSON.stringify(timetablearr[j][14]["courses_dept"] + timetablearr[j][14]["courses_id"] + ":" + roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"])
                }
                else
                {  newtimetablearr[j]={}
                    newtimetablearr[j]=JSON.stringify(roomarray[j]["rooms_shortname"] + roomarray[j]["rooms_number"]+ "haven't been used")
                }}
            console.log(newtimetablearr)
       generateTable(newtimetablearr);

        }






jQuery("#datagathering2").submit(function(e) {
    console.log("jump to chart")
    e.preventDefault();
    //var department = jQuery("#departmentchart").val()
   // var departmentchoose = jQuery("#coursechooses").val()
   // var course = jQuery("#coursechart").val()
    var building = jQuery("#buildingchart").val()
    var buildingchoose = jQuery("#typechooses").val()
    var query;


    console.log("jumptohere")
    if (buildingchoose === "roomtype") {
        query = JSON.stringify(
            {
                "GET": ["rooms_type", "Roomnumber"],
                "WHERE": {"IS": {"rooms_shortname": building}},
                "GROUP": ["rooms_type"],
                "APPLY": [{"Roomnumber": {"COUNT": "rooms_name"}}],
                "ORDER": {"dir": "UP", "keys": ["Roomnumber"]},
                "AS": "TABLE"
            })

    }
    else {
        query = JSON.stringify(
            {
                "GET": ["rooms_furniture", "Roomnumber"],
                "WHERE": {"IS": {"rooms_shortname": building}},
                "GROUP": ["rooms_furniture"],
                "APPLY": [{"Roomnumber": {"COUNT": "rooms_name"}}],
                "ORDER": {"dir": "UP", "keys": ["Roomnumber"]},
                "AS": "TABLE"
            })


    }
    try {

        console.log("building" + building)
        console.log(query)

        $.ajax("/query", {
            type: "POST", data: query, contentType: "application/json", dataType: "json", success: function (data) {
                var rawdata = data["result"]
                var length = rawdata.length
                var newdata = []
                for (var i = 0; i < length; i++) {
                    newdata[i] = {}
                    if (Object.keys(rawdata[i])[0] === "rooms_furniture") {
                        newdata[i]["label"] = rawdata[i]["rooms_furniture"]
                        newdata[i]["value"] = rawdata[i]["Roomnumber"]
                    }
                    else {

                        newdata[i]["label"] = rawdata[i]["rooms_type"]
                        newdata[i]["value"] = rawdata[i]["Roomnumber"]

                    }
                }
                generatepiechart(newdata)

            }
        }).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    } catch (err) {
        spawnErrorModal("Query Error", err);
    }

});


    jQuery("#datagathering1").submit(function(e) {
        e.preventDefault();
        console.log("jump in")
        var department = jQuery("#departmentchart1").val()
        console.log("department"+department)
        var departmentchoose = jQuery("#coursechooses").val()
        console.log("course"+departmentchoose)
        var query
   if(departmentchoose==="course")
    {query=JSON.stringify({

            GET: ["courses_dept", "courses_id", "Passrate(%)", "AverageGrade"],
                WHERE:
                {"IS": {"courses_dept": department}
        },
            GROUP: ["courses_dept", "courses_id"],
                APPLY: [{"Passrate(%)": {"AVG": "courses_passrate"}},
                    {"AverageGrade":{"AVG":"courses_avg"}}],
            ORDER: {"dir": "UP", "keys": ["Passrate(%)","AverageGrade","courses_dept", "courses_id"]},
            AS: "TABLE"

        })}
        else
    {query=JSON.stringify({

            GET: ["courses_dept", "courses_instructor","Passrate(%)"],
            WHERE:
            {"IS": {"courses_dept": department}
            },
            GROUP: ["courses_dept", "courses_instructor"],
            APPLY: [{"Passrate(%)": {"AVG": "courses_passrate"}}],
            ORDER: {"dir": "UP", "keys": ["Passrate(%)", "courses_dept", "courses_id"]},
            AS: "TABLE"
        })
    }



    try {
        console.log("query"+query)



        $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
        var rawdata=data["result"]
        var length=rawdata.length
         var newdata=[]
            for(var i=0;i<length;i++){
            newdata[i]={};
            if(rawdata[i]["courses_id"]!=undefined)
            {
                newdata[i]["label"]=rawdata[i]["courses_id"]+rawdata[i]["courses_instructor"]
            }
            else
                {
                newdata[i]["label"] = rawdata[i]["courses_instructor"]
            }
            newdata[i]["value"]=rawdata[i]["Passrate(%)"]
            }
             generate2dcolumn(newdata)


        }}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    } catch (err) {
        spawnErrorModal("Query Error", err);
    }
});

    jQuery("#datagathering3").submit(function(e) {
        e.preventDefault();
        var department = jQuery("#departmentchart").val()
        var course = jQuery("#coursechart").val()
      var query;
       query=JSON.stringify({

            GET: ["courses_dept","courses_instructor","Passrate(%)", "AverageGrade"],
            WHERE:
            {"IS": {"courses_name": department+course}
            },
            GROUP: ["courses_dept", "courses_instructor"],
            APPLY: [{"Passrate(%)": {"AVG": "courses_passrate"}},
                {"AverageGrade":{"AVG":"courses_avg"}}
            ],
            ORDER: {"dir": "UP", "keys": ["AverageGrade","Passrate(%)","courses_instructor"]},
            AS: "TABLE"
        })
        console.log(query)

        try {
          //  console.log("department"+department)


            console.log("query"+query)

            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                var rawdata=data["result"]
                var length=rawdata.length
                var newdata=[]
                for(var i=0;i<length;i++){
                    newdata[i]={};
                    if(rawdata[i]["courses_id"]!=undefined)
                    {
                        newdata[i]["label"]=rawdata[i]["courses_id"]+rawdata[i]["courses_instructor"]
                    }
                    else
                    {
                        newdata[i]["label"] = rawdata[i]["courses_instructor"]
                    }
                    newdata[i]["value"]=rawdata[i]["Passrate(%)"]
                }
                console.log(newdata)
                generate2dcolumn(newdata)


            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });





    function generateTable(data) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title,
                cl: "title",
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select("#render");
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").style("margin", "auto");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                return d["cl"]
            })
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }
 function generatepiechart (data) {
           $("#chart-container").insertFusionCharts({
                   type: "pie3d",
                    width: "700",
                    height: "600",
                    dataFormat: "json",
                    dataSource: {
                        chart: {
                                caption: "UBC room",
                          // subCaption: "Enter SubCaption of Chart",
                                  //  numberPrefix: "",
                                    theme: "ocean"
                            },
                        data: data
               }
         });
       }

    function generate2dcolumn (data) {
        $("#chart-container").insertFusionCharts({
            type: "column2d",
            width: "100%",
            height: "100%",
            dataFormat: "json",
            dataSource: {
                chart: {
                    caption: "UBC course passrate",
                    // subCaption: "Enter SubCaption of Chart",
                    numberPrefix: "%",
                    theme: "ocean"
                },
                data:data
            }
        });
    }

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }


});

