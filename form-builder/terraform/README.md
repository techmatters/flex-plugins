# Deploying the form builder

The builder runs at **form-builder.aselo.org** in the `management` environment of the Aselo AWS
account. Pieces:

| Piece | Where | Status |
|---|---|---|
| Okta: sign-in app, its authorization server, the groups | `okta/` (this folder) | Ready to plan |
| API code for the Lambda (master snapshot, S3 drafts, GitHub Apply, Slack) | `server/lambda.ts`, `npm run build:lambda` | Done |
| Sign-in in the page (Okta, PKCE) | `src/auth.ts` | Done |
| AWS: S3 site + CloudFront, API Gateway + Lambda, private drafts bucket | `aws/` | To do |
| GitHub App that opens the Apply PRs | GitHub, by an org owner | Steps below |
| Slack webhook for "submitted for review" | Slack | Steps below |
| Deploys | GitHub Actions workflow | To do |

Secrets never go in this repo (it's public). They live in SSM Parameter Store, us-east-1, under
`/form-builder/`, and only the builder's Lambda can read them.

## Okta

Who can use the builder comes from Okta groups:

| Group | Who | Can |
|---|---|---|
| `form-builder-aselo-staff` | Aselo staff | Every helpline, staff-only settings, the service configuration, Apply |
| `form-builder-<code>` | That helpline's staff | Their helpline's drafts, submit for review |

The list starts empty, so only Aselo staff can use the builder. A helpline gets its group when
its code is added to `helplines` in `okta/terragrunt.hcl`, once it starts using the builder.

The app signs in with authorization code + PKCE against its own authorization server
(*Aselo Form Builder*), whose access tokens carry a `groups` claim with only the
`form-builder-*` groups. The API checks the token (API Gateway JWT authorizer) and reads the role
and helplines from it. The server only issues tokens to this app, so nothing shared changes.

### Before the first plan (once)

The Okta Terraform service app (`aselo-terraform`, the one twilio-iac's Okta stages use) needs
two more things, because it also creates an authorization server:

1. Okta Admin › Applications › *aselo-terraform* › **Okta API Scopes**: grant
   `okta.authorizationServers.read` and `okta.authorizationServers.manage`.
2. Security › Administrators: add the **API Access Management Administrator** role to it.

It already has the app and group permissions, and the SSM parameters
(`/terraform/okta/terraform_service_app/*`) and IAM read access are the same as for
twilio-iac's Okta stages.

### Plan and apply

On the devops node, from `form-builder/terraform/okta`:

```bash
make plan
```

The first plan adds the `form-builder-aselo-staff` group, the app, its authorization server with 3
claims, a policy and a rule, and the group's assignment to the app. A person reviews
it and runs `make apply`. The outputs (`issuer`, `audience`, `client_id`) are not secret; the AWS
part reads them.

### Adding people

Okta Admin › Directory › Groups › the group › **Assign people**. Removing someone from the group
removes their access at their next sign-in (tokens last 8 hours).

## GitHub App (Apply)

Apply opens a branch and a PR with the draft's changes. It uses a GitHub App owned by the
`techmatters` organization, not a person's token, so PRs don't depend on anyone's account.

Steps (an organization owner, or someone they make a *GitHub App manager*):

1. GitHub › techmatters organization › **Settings › Developer settings › GitHub Apps › New GitHub App**.
2. Name **Aselo Form Builder**. Homepage URL `https://form-builder.aselo.org`.
3. **Webhook**: untick *Active* (the builder doesn't listen to GitHub).
4. **Repository permissions**: *Contents* Read and write, *Pull requests* Read and write.
   *Metadata* Read-only is added automatically. Nothing else.
5. **Where can this GitHub App be installed?** *Only on this account*. Create it.
6. On the app's page, note the **App ID**. Under *Private keys*, **Generate a private key**: a
   `.pem` file downloads.
7. **Install App** › techmatters › *Only select repositories*: `flex-plugins` only (the form
   definitions, the service configuration and the webchat translations are all in it). After
   installing, the URL ends in `/installations/<number>`: that's the **installation ID**.
8. Put the three values in SSM (us-east-1), from the AWS console:
   - `/form-builder/github_app/app_id` (String)
   - `/form-builder/github_app/installation_id` (String)
   - `/form-builder/github_app/private_key` (SecureString, the whole `.pem` contents)

   Then delete the downloaded `.pem`. Don't paste the key anywhere else.

If branch protection requires reviews on `master`, nothing changes: the app only opens PRs, and
people review and merge them as usual.

## Slack (submitted for review)

1. Create an incoming webhook for the channel that should get "submitted for review" messages
   (Slack › Apps › an app with *Incoming Webhooks* on › *Add New Webhook to Workspace*).
2. Put its URL in SSM: `/form-builder/slack_webhook_url` (SecureString).

The same notification also goes to support@aselo.org by email.
