// Xray's not needed, remove it by commenting this out and un-commenting the AWS below!
const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

// const AWS = require('aws-sdk');
const sf = new AWS.StepFunctions();
// Don't need to use callbacks as the task token message is what we use here
exports.handler = async function (event, context) {
    // try {
    return new Promise((resolve, reject) => {
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
        console.log("Test!");
        sf.listExecutions(listParams, async function (err, data) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {//Always going to be at least 1 as we're running one.
                // return new Promise((resolve, reject) => { 
                // setTimeout(resolve, 100, true);
                // });
                console.log(data);
                console.log('data length = ' + data.executions.length);
                if (!(data.executions.length > 1)) {
                    if (data.executions[0].executionArn == event.SFContext.Execution.Id) {
                        //Then we just have this one running and we're good to go!
                        sf.sendTaskSuccess(taskSuccessParams, (err, data) => {
                            if (err) {
                                console.log(err.message);
                                // return;
                                reject(err);
                            } else {
                                //All done, end
                                // return;
                                console.log(data);
                                resolve(data);
                            }
                        });
                    }
                } else {
                    //Then more than one running or it's a fail
                    taskFailureParams.cause = 'More than one execution running!';
                    sf.sendTaskFailure(taskFailureParams, async function (err, data) {
                        if (err) {
                            console.log(err.message);
                            reject(err);
                            // return;
                        } else {
                            console.log(data);
                            resolve(data);
                            // return;
                        }
                    });
                }
                console.log("We should not be here");
            }
        });
    });
    // } catch (e) {
    //     console.log(e);
    // } finally {
    //     let taskFailureParams = {
    //             cause: 'Error!',
    //             error: '>1',
    //             taskToken: event.TaskToken
    //         };
    //     //Odds are we won't be here, lets end this task so we don't impact other runs!   
    //     sf.sendTaskFailure(taskFailureParams,  async function (err, data) {
    //         if (err) console.log(err, err.stack); // an error occurred
    //         else console.log(data);           // successful response
    //     });
    // }

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
