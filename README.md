# flex-plugins

[![Actions Status](https://github.com/tech-matters/flex-plugins/workflows/Run%20plugin-hrm-form%20CI/badge.svg)](https://github.com/tech-matters/flex-plugins/actions)

The Aselo frontend is built as a [Twilio Flex Plugin](https://www.twilio.com/docs/flex/developer/plugins) in React and TypeScript.  See [aselo.org](https://aselo.org/) or [contact Aselo](https://aselo.org/contact-us/) for more information.

## git-secrets

In order to prevent sensitive credentials to be leaked, please follow this instructions to setup `git-secrets`.

- Install [git-secrets](https://github.com/awslabs/git-secrets) in your computer.
- Go into the repo root folder.
- Run `git secrets --register-aws`.
- Run `git config --local core.hooksPath .githooks/`.

## Local Development


### Requirements

[nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows)
[docker](https://docs.docker.com/get-docker/)

We depend on aws cli running inside of docker for some setup. You will need valid IAM access keys configured on your local machine to run some commands.
