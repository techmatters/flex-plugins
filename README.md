[![Actions Status](https://github.com/tech-matters/flex-plugins/workflows/Run%20plugin-hrm-form%20CI/badge.svg)](https://github.com/tech-matters/flex-plugins/actions)
# flex-plugins

The Aselo frontend is built as a [Twilio Flex Plugin](https://www.twilio.com/docs/flex/developer/plugins) in React and TypeScript.  See [aselo.org](https://aselo.org/) or [contact Aselo](https://aselo.org/contact-us/) for more information.

## git-secrets
In order to prevent sensitive credentials to be leaked, please follow this instructions to setup `git-secrets`.
- Install [git-secrets](https://github.com/awslabs/git-secrets) in your computer.
- Go into the repo root folder.
- Run `git secrets --register-aws`.
- Run `git config --local core.hooksPath .githooks/`.
