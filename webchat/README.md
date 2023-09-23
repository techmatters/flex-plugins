# webchat

Webchat software for Aselo built on [Twilio Flex Webchat](https://www.twilio.com/docs/flex/developer/webchat/setup).  See [aselo.org](https://aselo.org/) or [contact Aselo](https://aselo.org/contact-us/) for more information.

## git-secrets
In order to prevent sensitive credentials to be leaked, please follow this instructions to setup `git-secrets`.
- Install [git-secrets](https://github.com/awslabs/git-secrets) in your computer.
- Go into the repo root folder.
- Run `git secrets --register-aws`.
- Run `git config --local core.hooksPath .githooks/`.