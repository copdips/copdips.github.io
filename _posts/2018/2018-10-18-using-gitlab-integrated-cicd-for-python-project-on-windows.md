---
title: "Using Gitlab integrated CICD for Python project on Windows"
excerpt: "Gitlab ships with its own free CICD which works pretty well. This post will give a .gitlab-ci.yml demo for a Python project running on Gitlab Windows runner."
tags:
  - gitlab
  - cicd
  - python
  - powershell
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

{% include toc title="Table of content" %}

> Gitlab ships with its own free CICD which works pretty well. This post will give you an example of the CICD file `.gitlab-ci.yml` for a Python project running on [Gitlab Windows runner](https://copdips.com/2018/09/install-gitlab-runner-on-windows-by-powershell-psremoting.html).

# Some docs on the Internet

1. [Official GitLab Continuous Integration (GitLab CI/CD)](https://docs.gitlab.com/ee/ci/README.html)
2. [Official Configuration of your jobs with .gitlab-ci.yml ](https://docs.gitlab.com/ee/ci/yaml/README.html)
3. [Official Gitlab Pipelines settings](https://docs.gitlab.com/ee/user/project/pipelines/settings.html)
4. [Official Publish code coverage report with GitLab Pages](https://about.gitlab.com/2016/11/03/publish-code-coverage-report-with-gitlab-pages/)
5. [introduction-gitlab-ci](https://blog.eleven-labs.com/fr/introduction-gitlab-ci/)
6. [Rubular: a Ruby regular expression editor and tester](http://rubular.com/)

# Code Coverage

The official doc on how to use coverage is not very clear.

My coverage tool's output (from `pytest --cov=`) is something like :
```
----------- coverage: platform win32, python 3.7.0-final-0 -----------
Name                                      Stmts   Miss  Cover
-------------------------------------------------------------
python_project\__init__.py                    6      0   100%
python_project\ctx_fetcher.py                15      0   100%
python_project\extras\__init__.py             0      0   100%
python_project\extras\celery.py              18     18     0%
python_project\filters.py                     6      2    67%
python_project\parser.py                     26      0   100%
python_project\request_id.py                 42      1    98%
-------------------------------------------------------------
TOTAL                                       113     21    81%
```

In my example [.gitlab-ci.yml](https://copdips.com/2018/10/using-gitlab-integrated-cicd-for-python-project-on-windows.html#gitlab-ci-yml-file-content), the coverage is configured as:

```yml
coverage: '/^TOTAL.*\s+(\d+\%)$/'
```

This regex will find the coverage which is at `81%`.

**Be aware that**:
1. The coverage only use regular expression to find the coverage percentage from coverage tool's output.
2. The regular expression must be surrounded by single quote `'`, double quote is not allowed.
3. Inside the single quotes, must be surrounded by `/`.
4. You can use <http://rubular.com> to test your regex.
5. The overage regex returns the last catch group value from the output. Even if it is not in the last line, or if the regex catches more than one values among all the lines.

# .gitlab-ci.yml example for Python project on a Windows runner

## .gitlab-ci.yml file content

I cloned the project [flask_log_request_id](https://github.com/Workable/flask-log-request-id) and try to run CICD over it.

I'm still working on this CICD `.gitlab-ci.yml` file, the example given here will be updated as long as I add new things inside.
{: .notice--info}

```yml
before_script:
  - >
    function Write-PythonPath {
        $pythonPath = $(Get-Command python | % source)
        Write-Output "The python path is at: '$pythonPath'"
    }
  - Get-Location
  - git --version
  - python --version
  - Write-PythonPath
  - Get-ChildItem env:\CI_* | Select-Object Name, Value | ft -a
  - Get-ChildItem variable:\ | Select-Object Name, Value | ft -a
  - $venvPath = "$env:temp/venv/$($env:CI_COMMIT_SHA)"
  - >
    function Enable-Venv {
        Invoke-Expression "$venvPath/Scripts/activate.ps1"
        Write-PythonPath
    }

stages:
    - venv
    - test
    - build
    - deploy

venv:
  stage: venv
  script:
    - python -m venv $venvPath
    - Enable-Venv
    - python -m pip install -U pip setuptools wheel
    - pip install flake8 nose pytest mock coverage pytest-cov celery flask

pytest:
  stage: test
  script:
    - Enable-Venv
    - pytest --cov=flask_log_request_id --cov-report=html
    - $coverageLine = (Get-Content .\htmlcov\index.html | Select-String "pc_cov").line
    - $coverageString = ($coverageLine -replace "<[^>]*>", "").trim()
    - Write-Output "Total Coverage $coverageString"
  coverage: '/^(?i)(TOTAL).*\s+(\d+\%)$/'


nosetests:
  stage: test
  script:
    - Enable-Venv
    - nosetests.exe
  coverage: '/^TOTAL.*\s+(\d+\%)$/'

flake8:
  stage: test
  script:
    - Enable-Venv
    - flake8.exe .\flask_log_request_id
```

## .gitlab-ci.yml results from pipeline view

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-10-18-using-gitlab-integrated-cicd-for-python-project-on-windows/gitlab-ci.yml_result_from_pipeline_view.PNG)

## .gitlab-ci.yml results from job view

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-10-18-using-gitlab-integrated-cicd-for-python-project-on-windows/gitlab-ci.yml_result_from_job_view.PNG)

## .gitlab-ci.yml results from merge_request view

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-10-18-using-gitlab-integrated-cicd-for-python-project-on-windows/gitlab-ci.yml_result_from_merge_request_view.PNG)