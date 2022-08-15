import { getDBData, postData } from '../connector.js'
import { v4 as uuidv4 } from 'uuid';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
let databaseDate = 0;
let databaseMonth = 0;
let currentWeekID;
let dayCount;
let streak;


export const start = ()=>{
    let command = `select * from utility_table`;
    getDBData(command, (r)=>{
        databaseDate = parseInt(r[0]["date"])
        databaseMonth = parseInt(r[0]["month"])
        dayCount = parseInt(r[0]["dayCount"]);
        streak = parseInt(r[0]["streak"]);
        currentWeekID = r[0]["weekID"];
        if (dayCount >= 7){
            currentWeekID = uuidv4()
            command = `update utility_table set weekID = '${currentWeekID}', dayCount = ${1}`;
            postData(command, (res)=>{
                console.log("week id updated");
            });
        }
        setInterval(function (){
            checkTime();
        }, 1000);
    });
}


function checkTime(){
    let command;
    let currentTime = new Date();
    let currentDate = currentTime.getDate();
    let currentMonth = currentTime.getMonth()+1;
    let currentYear = currentTime.getFullYear();
    let toggle = true;

    
    if(currentMonth != databaseMonth){
        toggle = false;
        databaseMonth = currentMonth;
        command = `update utility_table set month = ${currentMonth}`
        postData(command, (r)=>{
            console.log("done")
        });
        let tableName = `${MONTHS[currentMonth-1]}_${currentYear}`
        command = `CREATE TABLE ${tableName}(
            taskID INT NOT NULL AUTO_INCREMENT, 
            taskName VARCHAR(200),
            taskDescription VARCHAR(500),
            taskDate DATE,
            taskStartTime Time, 
            taskEndTime Time,
            taskIsDone Bool,
            isPermanent Bool,
            isWeekly Bool,
            weekID varchar(60), 
            dayNo int,
            PRIMARY KEY (TaskID));`;
        postData(command, (r)=>{
            console.log("table added");
            shiftDataToTable(tableName);
        });

    }
    else if((currentDate != databaseDate) && toggle){
        databaseDate = currentDate;
        command = `update utility_table set date = ${currentDate}`
        postData(command, (r)=>{
            console.log("date updated")
        });
        let tableName = `${MONTHS[currentMonth-1]}_${currentYear}`
        shiftDataToTable(tableName);
    }
}

function shiftDataToTable(table){
    let command = `select * from current_tasks where taskIsDone = true; select count(taskName) from current_tasks;`;
    let currentTasks = []
    getDBData(command, (response)=>{
        let rows = response[0];
        for(let i = 0; i < rows.length; i++){
            let object = {
                taskName: rows[i]["taskName"],
                taskDes: rows[i]["taskDescription"],
                taskDate: rows[i]["taskDate"],
                taskStartTime: rows[i]["taskStartTime"],
                taskEndTime: rows[i]["taskEndTime"],
                isPermanent: rows[i]["isPermanent"],
                isWeekly: rows[i]["isWeekly"]
            }
            currentTasks.push(object);
        }
        let totalTask = parseInt(response[1][0]["count(taskName)"]);
        if (currentTasks.length == totalTask){
            streak += 1;
            let command = `update utility_table set streak = ${streak}`;
            postData(command, (res)=>{
                console.log("streak incremented");
            });
        }
        else{
            streak = 0;
            let command = `update utility_table set streak = ${streak}`;
            postData(command, (res)=>{
                console.log("streak is Zero");
            });
        }
        reset("current_tasks")
        for(let i = 0; i < currentTasks.length; i++){
            let dateFormat = getDate(currentTasks[i].taskDate)
            let command = `insert into ${table} (taskName, taskDescription, taskDate, taskStartTime, taskEndTime, taskIsDone, isPermanent, isWeekly, weekID, dayNo) 
                values ("${currentTasks[i].taskName}", "${currentTasks[i].taskDes}", '${dateFormat}', '${currentTasks[i].taskStartTime}', '${currentTasks[i].taskEndTime}', true, ${currentTasks[i].isPermanent}, ${currentTasks[i].isWeekly}, 
                '${currentWeekID}', ${currentTasks[i].taskDate.getDay()})`;
        
            console.log(command);
            postData(command, (r)=>{
                console.log("data added in the table");
            });
        }
        let command =  `select distinct taskName, taskDescription, taskStartTime, taskEndTime from ${table} where isWeekly = true and dayNo = ${new Date().getDay()}`
        getDBData(command, (rows)=>{
            for(let i = 0; i < rows.length; i++){
                let dateStr = getDate(new Date())
                let command = `insert into current_tasks (taskName, taskDescription, taskDate, taskStartTime, taskEndTime, taskIsDone, isPermanent, isWeekly) 
                    values ("${rows[i].taskName}", "${rows[i].taskDescription}", '${dateStr}', '${rows[i].taskStartTime}', '${rows[i].taskEndTime}', false, false, true)`;
                postData(command, (res)=>{
                    console.log("weekly task added");
                });
            }
            let dateFormat = getDate(new Date());
            command = `update current_tasks set taskDate = '${dateFormat}', taskIsDone = false where isPermanent = true;`
            postData(command, (res)=>{
                console.log("Permanent task updated");
            });
        });
        dayCount++;
        command = `update utility_table set dayCount = ${dayCount}`;
        postData(command, (r)=>{
            console.log("day count incremented");
        });
        
    });
}

function getDate(time){
    let date = time;
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}


function reset(table){
    let command = `delete from ${table} where taskIsDone = true and isPermanent = false;`;
    // `alter table ${table} auto_increment 1;`
    postData(command, (res)=>{
        console.log("deleted");
    });
}
