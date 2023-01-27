---
last_modified_at:
title: "Sonarcloud Github Action"
excerpt: ""
tags:
  - github-action
  - sonar
  - cicd
published: true
# header:
#   teaserlogo:
#   teaser: ''
#   image: ''
#   caption:
gallery:
  - image_path: ''
    url: ''
    title: ''
---

[Sonarcloud Github Action](https://github.com/SonarSource/sonarcloud-github-action) doesn't work by default with Python pytest `coverage.xml` file, hereunder a working example.

## file `.github/workflows/ci.yml`

```yaml
# file: .github/workflows/ci.yml

# irrelevant part is removed
env:
  pytest_coverage_xml_file_name: coverage.xml

- name: Test with pytest
  run: |
    pytest -v -s \
      --cov=$app_folder_name \
      --cov-fail-under=$coverage_percent \
      --cov-report=xml:$pytest_coverage_xml_file_name \
      --cov-report=term-missing:skip-covered

# Codecov is a nice tool so given here too
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    env_vars: OS,PYTHON
    fail_ci_if_error: true
    flags: unittests
    name: codecov-repo_name
    files: coverage.xml
    verbose: true

- name: Test pytest with pytest-coverage-commentator
  run: |
    pytest --cache-clear --cov=$app_folder_name > $pytest_coverage_commentator_filename

- name: Comment PR with coverage
  uses: coroo/pytest-coverage-commentator@v1.0.2
  with:
    pytest-coverage: ${{ env.pytest_coverage_commentator_filename }}

- name: Override Coverage Source Path for Sonar
  # https://community.sonarsource.com/t/code-coverage-doesnt-work-with-github-action/16747/7
  # we should convert '<source>/home/runner/work/pr/repo_name/app_folder_name</source>' to '<source>/github/workspace//app_folder_name</source>'
  # be careful DOUBLE slashes in the later part, and the app_folder_name in the later part is retrieved from sonar.sources from sonar-project.properties
  run: |
    echo "GITHUB_WORKSPACE=$GITHUB_WORKSPACE"
    echo 'coverage.xml before:'
    head $GITHUB_WORKSPACE/$pytest_coverage_xml_file_name
    sed -i 's@'$GITHUB_WORKSPACE'@/github/workspace/@g' $GITHUB_WORKSPACE/$pytest_coverage_xml_file_name
    echo 'coverage.xml after:'
    head $GITHUB_WORKSPACE/$pytest_coverage_xml_file_name

- name: SonarCloud Scan
  uses: sonarsource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## file `sonar-project.properties`

Hereunder an example of the file `sonar-project.properties`

```ini
# https://github.com/pbrod/numdifftools/blob/master/sonar-project.properties
# https://github.com/pbrod/numdifftools/blob/master/sonar-project_readme.txt
# https://github.com/SonarSource/sonarcloud-github-action

sonar.organization=copdips
sonar.projectKey=copdips_reponame

# relative paths to source directories. More details and properties are described
# in https://sonarcloud.io/documentation/project-administration/narrowing-the-focus/
sonar.sources=folder_name

sonar.projectVersion=${env.build_number}
# sonar.python.pylint_config=.pylintrc
sonar.python.version=3.8, 3.9, 3.10

# https://docs.sonarqube.org/latest/analysis/coverage/
# https://docs.sonarqube.org/latest/analysis/analysis-parameters/
sonar.tests=tests
sonar.python.coverage.reportPaths=${env.pytest_coverage_xml_file_name}
```
