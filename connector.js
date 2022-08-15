import mysql from 'mysql'

export const mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Bhupinder@1234",
    database: "scheduled_task_database",
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log("connected");

    }
    else {
        console.log(err);
        console.log("Not connected");
    }
});

export const getDBData = (command, callback)=> {
    mysqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            return callback(rows);
        }
        else {
            console.log(err);
        }
    });
}

export const postData = (command, callback)=> {
    mysqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            console.log("OK");
            return callback("added");
        }
        else {
            console.log(err);
        }
    });
}

