# Deploying the form builder

The builder runs at **form-builder.tl.techmatters.org** in the `management` environment of the
Aselo AWS account (DNS in the `tl.techmatters.org` Route 53 zone of the same account). Pieces:

| Piece | Where | Status |
|---|---|---|
| Okta: sign-in app, its authorization server, the groups | `okta/` (this folder) | Applied |
| API code for the Lambda (master snapshot, S3 drafts, Slack) | `server/lambda.ts`, `npm run build:lambda` | Done |
| Sign-in in the page (Okta, PKCE) | `src/auth.ts` | Done |
| AWS: S3 site + CloudFront, API Gateway + Lambda, private drafts bucket | `aws/` (this folder) | Applied |
| AWS: recordings bucket + recordings.tl.techmatters.org (flow designer) | `aws/` (this folder) | Ready to plan |
| Slack webhook for "submitted for review" | Slack | Steps below (optional) |
| Deploys (the page and the Lambda's code) | `.github/workflows/form-builder-deploy.yml` | Ready |
| GitHub App, so Apply opens the PR | GitHub, by an org owner | Later, after the proof of concept |

### Applying, for the proof of concept

The builder doesn't write to GitHub yet. Reading master needs no credentials (flex-plugins is
public). To apply a draft, Aselo staff:

1. Review it in the builder and **Download as zip** (laid out like the repo, with a `CHANGES.md`).
2. Unzip it at the root of a flex-plugins checkout, on a new branch, check the diff and open a PR
   as usual (paste `CHANGES.md` as the description).
3. Once it's merged and deployed, **discard the draft** in the builder.

When the proof of concept is approved, the GitHub App below lets **Apply** do steps 1 and 2 (the
code is in `server/githubApplier.ts`).

Secrets never go in this repo (it's public). They live in SSM Parameter Store, us-east-1, under
`/form-builder/`, and only the builder's Lambda can read them.

## Order

1. `okta/`: plan and apply (once; again when the domain or the helplines change).
2. `aws/`: plan and apply. It reads the Okta outputs from the Okta stage's state.
3. Deploy: push to the branch (or run the **Deploy form builder** workflow). It tests, builds and
   uploads the page and the Lambda's code.
4. Open https://form-builder.tl.techmatters.org and sign in with Okta.

## AWS

`aws/` is applied with `tf-admin` (state in `tl-terraform-state-management`) and creates:

- the certificate for the domain (validated through Route 53) and its A/AAAA records;
- CloudFront, serving the page from a private S3 bucket (`tl-form-builder-site`) and sending
  `/api/*` to API Gateway. Paths without a file extension serve `index.html` (a CloudFront
  function), so `/login/callback` works;
- `/config.json` in the site bucket: the Okta issuer and client id the page signs in with;
- API Gateway (HTTP API), whose JWT authorizer only lets through access tokens from the builder's
  Okta authorization server (its issuer, audience `api://form-builder`);
- the Lambda (`form-builder-api`, Node 22) with placeholder code, its role (the drafts bucket,
  the `/form-builder/*` SSM parameters, its logs) and a log group kept 30 days;
- the drafts bucket (`tl-form-builder-drafts`): private, versioned, old versions kept 90 days;
- a policy on the `github-actions` IAM user so the deploy workflow can upload the page and the
  Lambda's code and refresh CloudFront, for these resources only;
- the flow designer's recordings (`modules/aws/recordings.tf`): a private, versioned bucket
  (`tl-aselo-recordings`, old versions kept a year) with a folder per helpline (`<code>/staging/`,
  `<code>/production/`), served publicly at **recordings.tl.techmatters.org** through its own
  CloudFront distribution and certificate, so Studio can play them. The bucket accepts uploads
  from the builder's page (CORS, `PUT` only) through links the Lambda signs; the Lambda can list,
  upload, copy (publish) and remove recordings and refresh their CloudFront cache, and gets
  `RECORDINGS_BUCKET`, `RECORDINGS_URL` and `RECORDINGS_DISTRIBUTION_ID`. Who uploaded, approved
  and published each recording is kept in the drafts bucket (`recordings/<code>.json`), not in
  the public one.

On the devops node, from `form-builder/terraform/aws`: `make plan`, then `make apply`.

Adding the recordings to an `aws/` that was already applied shows them as new resources (bucket,
its settings and policy, certificate and its validation record, CloudFront distribution, A/AAAA
records) plus two changes to the Lambda: its environment and its role's policy. Nothing else
changes. Until it's applied, the deployed builder says recordings aren't set up.

The deploy workflow runs on every push to `alejandro-c/flow_designer` (which holds the form builder
as well as the flow designer) that touches
`form-builder/` (a manual-only workflow can't be started before it's on master). Until `aws/` is
applied it skips the upload with a notice.

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

## GitHub App (Apply), later

Not needed for the proof of concept. With it, Apply opens a branch and a PR with the draft's
changes. It uses a GitHub App owned by the
`techmatters` organization, not a person's token, so PRs don't depend on anyone's account.

Steps (an organization owner, or someone they make a *GitHub App manager*):

1. GitHub › techmatters organization › **Settings › Developer settings › GitHub Apps › New GitHub App**.
2. Name **Aselo Form Builder**. Homepage URL `https://form-builder.tl.techmatters.org`.
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
9. In `server/lambda.ts`, read those parameters and pass a `GitHubApplier` as the `applier`
   (and give the Lambda read access to them). Apply then appears for Aselo staff.

If branch protection requires reviews on `master`, nothing changes: the app only opens PRs, and
people review and merge them as usual.

## Slack (submitted for review)

1. Create an incoming webhook for the channel that should get "submitted for review" messages
   (Slack › Apps › an app with *Incoming Webhooks* on › *Add New Webhook to Workspace*).
2. Put its URL in SSM: `/form-builder/slack_webhook_url` (SecureString).

For the proof of concept there is no email; Slack only. Until the parameter exists, submissions are
only logged (CloudWatch).
