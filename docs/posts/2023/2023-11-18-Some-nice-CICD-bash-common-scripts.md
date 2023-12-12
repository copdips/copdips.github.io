---
authors:
- copdips
categories:
- cicd
- github
- azure
- shell
comments: true
date:
  created: 2023-11-18
description: ''
---

# Some nice cicd bash common scripts

During CICD, we often have a large log output, it might be nice to have some common scripts to help us to format the log output, so that we can easily find the information we need.

Recently, when working with Sonar, I found that they have some scripts for such output formatting.

<!-- more -->

- Common scripts: [common.sh](https://github.com/SonarSource/sonarqube-quality-gate-action/blob/master/script/common.sh)
- Source common script: [`source "$(dirname "$0")/common.sh"`](https://github.com/SonarSource/sonarqube-quality-gate-action/blob/f9fe214a5be5769c40619de2fff2726c36d2d5eb/script/check-quality-gate.sh#L3C9-L3C9)
- Also the Bash testing framework Bats:
  - [Installing Bats in CICD](https://github.com/SonarSource/sonarqube-quality-gate-action/blob/f9fe214a5be5769c40619de2fff2726c36d2d5eb/.github/workflows/run-qa.yml#L17-L28)
  - [Testing Bash script: check-quality-gate-test.bats](https://github.com/SonarSource/sonarqube-quality-gate-action/tree/master/test)
