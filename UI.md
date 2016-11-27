Explanation / Intructions on how to build and launch UI:

### (I) Course Explorer:
1Section explorer
- Purpose: render a table of sections according to filter chosen by clients
- Procedure:
client can choose one or two or all of the three filters to get sections information:
department, course number(courses id), courses title
(once you choose the department, course number and course title will render corresponding available course number and title in given 
department)

2)Course explorer
- Purpose:render a table of courses according to filter choose by clients
- Procedure
client can choose one or many of three filters to get sections info:
department, course title, courses size
(once you choose the department, course title will render corresponding available course number and title in given 
department)
for the department, there are three order keys(you can choose either one or many of them) : Courses Pass, Courses Failing, Courses avg



###(II)  Room Explorer:
- Purpose: render a table of rooms according to filter chosen by clients
- Procedure:
1) filter not contain distance:
client can choose one or many of four filters to get sections info:
building name, room number, room type, furniture type
(once you choose the building name, room number, room type, furniture type will render corresponding available course number and title in given department)

2) filter contain distance
client can choose one or many of four filters to get sections info:
room number, room type, furniture type,distance


###(III) Room Scheduling:
- Purpose: arrange a weekly schedule according to list of rooms and courses filtered by clients requirement
- Procedure
1)by typing a list of rooms shortname  and a list of courses name(eg: cpsc221) to arrange all these courses in all theses room in a schedule
2)by typing a list of department name, list of building name arrange all courses in those departments to rooms in those buildings 
3)by choosing a department and 1) building name or 2)a list of building within x meters in given building to arrange course


###(IV) Novel Function - Render Charts for Useful Data:
- Purpose: render chart for useful data for courses or rooms dataset
- Procedure:
1) show a 2d column for a chosen departments' courses useful data (pass rate) group by courses name or courses instructor
2) show a 2d column for a chosen courses useful data (pass rate by different instructor) 
(once you choose the department, course number will render corresponding available course number in a given 
department)
3) show a pie chart for list of rooms in a chosen building grouped by furniture type, room type or rooms seats(you can see the percentage component clearly)
