// Xray's not needed, remove it by commenting this out and un-commenting the AWS below!
const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

// const AWS = require('aws-sdk');
const sf = new AWS.StepFunctions();
// try {
    exports.handler = function (event, context, callback) {
        // console.log(JSON.stringify(event));
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

        sf.listExecutions(listParams, function (err, data) {
            if (err) console.log(err, err.stack);
            else {//Always going to be at least 1 as we're running one.
                console.log(data);
                console.log('data length = ' + data.executions.length);
                if (data.executions.length > 1) {
                    //Then more than one running and we should exit out probably
                    taskFailureParams.cause = 'More than one execution running!';
                    sf.sendTaskFailure(taskFailureParams, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else console.log(data);           // successful response
                    });
                } else {//Else just this one running
                    if (data.executions[0].executionArn == event.SFContext.Execution.Id) {
                        //Then we just have this one running and we're good to go!
                        console.log('TEST');
                        sf.sendTaskSuccess(taskSuccessParams, (err, data) => {
                            if (err) {
                                console.error(err.message);
                                callback(err.message);
                                return;
                            }else{
                                //All done, end
                                callback(null, "Success!");
                                return;
                            }
                        });
                    }
                }
                console.log("We should now bw here");
                taskFailureParams.cause = 'Not sure!';
                sf.sendTaskFailure(taskFailureParams, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else{
                        console.log(data);
                    }
                });
            }
        });


    };
// } catch (e) {
//     console.log(e);
// } finally {
//     let taskFailureParams = {
//             cause: 'Error!',
//             error: '>1',
//             taskToken: event.TaskToken
//         };
//     //Odds are we won't be here, lets end this task so we don't impact other runs!   
//     sf.sendTaskFailure(taskFailureParams, function (err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else console.log(data);           // successful response
//     });
// }

