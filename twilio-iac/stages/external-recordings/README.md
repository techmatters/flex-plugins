# External Recordings Stage

This stage is responsible for creating the IAM user and keys that will be used by Twilio to upload recordings to S3. It also has a noop step and a step to update the twilio service configuration with a configuration flag.

This is a separate stage for 2 reasons:

1. Security - the ability to create and manage IAM users is a very powerful permission. We want to limit the number of people who have this permission and the ability to run this stage. If this were part of the primary stage then anyone who wanted to be able to run other stages for even staging accounts would need to be a full admin of the AWS account.
2. Ability to run this stage for helplines that aren't converted to terragrunt or aren't managed by twilio-iac at all.
