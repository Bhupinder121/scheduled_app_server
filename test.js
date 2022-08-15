import { getDBData } from "./connector.js";

let command = `select * from current_tasks where taskIsDone = true; select count(taskName) from current_tasks;`

getDBData(command, (r)=>{
    let rows = r[0];
    let currentTasks = [];
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
    console.log(currentTasks);
    console.log(r[1][0]["count(taskName)"]);
});