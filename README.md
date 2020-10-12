**Intro**

Using this sort of Step Function, we can limit concurrency to >=1. When doing this, the Lambda function looks like so,

A quick few notes,

* The all checks for the last ten running executions and since we're limiting it to one, it's not needed to be this high, however you can change this as needed for concurrency.

* This handles most errors in terms of sending taskFails and there's a timeout set on the SF itself to prevent tasks being orphaned.

* I've moved a lot of functionality around into separated params to change independently.

I'm still building upon it, however it was a Kumo I thought would answer any further cases on this issue.


This current solution is limited by the amount of executions that can be returned from the list Executions call(1,000) this would involve adding additional functionality for recursively calling this should there be too many running executions.
