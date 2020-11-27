// Xray's not needed, remove it by commenting this out and un-commenting the AWS below!
const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

// const AWS = require('aws-sdk');
const sf = new AWS.StepFunctions();
// Don't need to use callbacks as the task token message is what we use here
exports.handler = async function (event, context) {
    try {
    console.log(JSON.stringify(event));
    var listParams = {
        stateMachineArn: event.SFContext.StateMachine.Id,
        maxResults: '10',
        statusFilter: 'RUNNING'
    };
    var taskSuccessParams = {
        output: "\"Callback task completed successfully.\"",
        taskToken: event.TaskToken
    };
    var taskFailureParams = {
        cause: 'Error!',
        error: '>1',
        taskToken: event.TaskToken
    };

    await sf.listExecutions(listParams, async function (err, data) {
        if (err) {
            console.log(err.message);
        }else {//Always going to be at least 1 as we're running one.
            console.log(data);
            console.log('data length = ' + data.executions.length);
            if (!(data.executions.length > 1)) {
                if (data.executions[0].executionArn == event.SFContext.Execution.Id) {
                    //Then we just have this one running and we're good to go!
                    await sf.sendTaskSuccess(taskSuccessParams, (err, data) => {
                        if (err) {
                            console.log(err.message);
                            return;
                        } else {
                            //All done, end
                            return;
                        }
                    });
                }
            } else {
                //Then more than one running or it's a fail
                taskFailureParams.cause = 'More than one execution running!';
                await sf.sendTaskFailure(taskFailureParams, function (err, data) {
                    if (err) {
                        console.log(err.message);
                        return;
                    } else {
                        return;
                    }
                });
            }
            console.log("We should not be here");
        }
    });
    

} catch (e) {
    console.log(e);
} finally {
    let taskFailureParams = {
            cause: 'Error!',
            error: '>1',
            taskToken: event.TaskToken
        };
    //Odds are we won't be here, lets end this task so we don't impact other runs!   
    sf.sendTaskFailure(taskFailureParams, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

};
    
    
//                           ,---.
//                           /    |
//                          /     |
//      Gandalf            /      |
//                       /       |
//                   ___,'        |
//                 <  -'          :
//                  `-.__..--'``-,_\_
//                     |o/ <o>` :,.)_`>
//                     :/ `     ||/)
//                     (_.).__,-` |\
//                     /( `.``   `| :
//                     \'`-.)  `  ; ;
//                     | `       /-<
//                     |     `  /   `.
//     ,-_-..____     /|  `    :__..-'\
//   /,'-.__\\  ``-./ :`      ;       \
//   `\ `\  `\\  \ :  (   `  /  ,   `. \
//      \` \   \\   |  | `   :  :     .\ \
//       \ `\_  ))  :  ;     |  |      ): :
//      (`-.-'\ ||  |\ \   ` ;  ;       | |
//       \-_   `;;._   ( `  /  /_       | |
//       `-.-.// ,'`-._\__/_,'         ; |
//           \:: :     /     `     ,   /  |
//           || |    (        ,' /   /   |
//           ||                ,'   / SSt|
