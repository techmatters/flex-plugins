# Helpline Configuration Files

## Overview

This directory contains the configuration files for all helplines. They are organized in a hierarchy of directories and files that are loaded in order to allow overriding of configuration values.

## Configuration Hierarchy

The configuration files are loaded in the following order:

1. `./defaults.hcl` - global default configuration values for all helplines.
2. `./<short_helpline>/common.hcl` - common configuration values for all environments for a specific helpline.
3. `./<short_helpline>/<environment>.hcl` - environment specific configuration values for a specific helpline.

This hierarchy could be extended to allow for more specific configuration values, but for now this should be sufficient.

## Configuration relationship to Stages

The generated configuration is passed in its entirety to every stage. The stages are responsible for determining which configuration values are relevant to them. This minimizes the dependencies between the stages.

## Advanced Configuration

[files](files/README.md) - Copy hardcoded terraform file into a stage's base terraform directory.
