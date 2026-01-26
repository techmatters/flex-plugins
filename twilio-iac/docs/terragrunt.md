# Terragrunt Overview

## Overview

Review the [terragrunt quick start](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/) to get a basic understanding of how terragrunt works in very basic setups.

## Working Directory, Cache, and Generate Blocks

Terragrunt doesn't do anything fancy in Go to run terraform commands in the module defined in the terraform block. It manages files in a cache on the local filesystem and then runs terraform commands in a working directory within that cache. It uses the `generate` block to generate files in the working directory before running terraform commands.

### Working Directory and Cache

Terragrunt copies files around to build the cache. The cache can come from git or, as in our use case, from the local filesystem. When using local terraform modules as the terraform source, terragrunt copies the dir structure before the `//` in the `source` argument into a local cache. It then uses the directory within that new cache that is defined after the `//` as a working dir for running terraform commands and generating blocks.

For example, If you have a terraform block in your `terragrunt.hcl` like this:

```hcl
terraform {
  source = "../../terraform-modules//stages/provision"
}
```

The entire directory structure at `../../terraform-modules` will be copied into the local cache. Then the directory relative path `stages/provision` within that cache will be used as the working directory for terragrunt. Terragrunt will run terraform commands from within that directory.

So in this simple example, if we weren't doing some magic to make helpline/environment argument driven, the `.terragrunt-cache` in the provision stage would look something like this:

```bash
.
└── F2j4digM03aWTyKSKHYuNOEi6Co
    └── 7LayNgw6Eg_jwfqrjmlASLY2lss
        ├── aws
...
        ├── stages
        │   ├── chatbot
        │   ├── configure
        │   └── provision
...
        └── taskRouter
```

The working directory would be in the `stages/provision` directory.

### Generate Blocks

Terragrunt uses the `generate` block to generate files in the working directory. It uses the `path` argument to determine where to put the generated file. It uses the `template` argument to determine what to put in the generated file. It uses the `if_exists` argument to determine what to do if the file already exists.

So, continuing the simple example above, if we had a generate block in our `terragrunt.hcl` like this:

```hcl
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  backend "s3" {
    bucket         = "tl-terraform-state-${local.environment}"
    key            = "twilio/${local.short_helpline}/${local.stage}/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    assume_role {
      role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-${local.environment}"
    }
  }
}
EOF
}
```

Then each time terragrunt runs, it will generate a `backend.tf` file in the `stages/provision` directory with the defined content. It will overwrite the file if it already exists.

Terragrunt will then run terraform commands in the `stages/provision` directory. Since all of the content in a directory is automatically included in the terraform plan, the `backend.tf` file will be included in the plan.

This very basic functionality allows us to use terragrunt to do many things to keep our terraform code DRY that aren't natively supported by terraform. Some of the same functionality can be achieved with terraform workspaces, but even terraform recommends that for long lived environments with massive changes, workspaces are [not the best solution](https://developer.hashicorp.com/terraform/cli/workspaces#when-not-to-use-multiple-workspaces).
