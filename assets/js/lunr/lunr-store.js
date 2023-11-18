var store = [{
        "title": "Setting up Github Pages With custom domain over HTTPS",
        "excerpt":"With Github pages, we can create our blogs in our own domain over HTTPS completely free. Of course you should pay for your domain name at the Registrar. Create Github pages on Github.com On Github create a repo with name : githubUserName.github.io Push a file index.html to branch master or...","categories": [],
        "tags": ["github","github-pages","web"],
        "url": "/2018/05/setting-up-github-pages-with-custom-domain-over-https.html",
        "teaser": null
      },{
        "title": "Setting Up Powershell gallery And Nuget gallery",
        "excerpt":"As like pypi for Python, npm for Node.js, we also have Powershell Gallery for Powershell to add some extra Powershell modules, and Nuget Gallery for Powershell to add some extra executables. Powershell version All commands provided here are tested on Windows 10 with Windows Powershell v5.1. Configure proxy in Powershell...","categories": [],
        "tags": ["nuget","powershell","powershell-gallery","packaging","proxy"],
        "url": "/2018/05/setting-up-powershell-gallery-and-nuget-gallery-for-powershell.html",
        "teaser": null
      },{
        "title": "Powershell stop-parsing (`--%`)",
        "excerpt":"A friend of mine told me about the Powershell stop-parsing (--%) last year, he said the stop-parsing tells powershell to treat the remaining characters in the line as a literal, but I’d never known where to use it. Recently working on git ssh made it happened. The use case is...","categories": [],
        "tags": ["powershell","parsing","ssh"],
        "url": "/2018/05/powershell-stop-parsing.html",
        "teaser": null
      },{
        "title": "Setting up Jekyll with Minimal Mistakes theme on Windows",
        "excerpt":"Do you want to preview Jekyll blog locally on Windows before publishing it to Internet? Many online tutorials about setting up Jekyll on Windows are out of date, I will show you in this post the 2018 version and with the Minimal Mistakes theme. Some online tutorials https://jekyllrb.com/docs/home/ https://help.github.com/articles/using-jekyll-as-a-static-site-generator-with-github-pages/ https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/...","categories": [],
        "tags": ["jekyll","web","windows","ruby"],
        "url": "/2018/05/setting-up-jekyll-with-minimal-mistakes-theme-on-windows.html",
        "teaser": null
      },{
        "title": "Using Readline In Python REPL On Windows With PyReadline and PtPython",
        "excerpt":"As an ex-sysadmin, I’m in love with the Readline. In Powershell, we have its variation PSReadline. In Python REPL on Windows OS, I’ll show you the PyReadline and the PtPython. PyReadline When you search on Internet, you will find many tutorials telling you to install a Python module called readline,...","categories": [],
        "tags": ["python","repl","readline"],
        "url": "/2018/05/using-readline-in-python-repl-on-windows.html",
        "teaser": null
      },{
        "title": "Select-ColorString : A Unix's grep-like Powershell Cmdlet Based On Select-String With Color",
        "excerpt":"Update 2019-12-28 Powershell 7 Select-String default highlighting Update 2019-12-28: It’s very exciting to see that since Powershell 7, the Select-String has highlighting (internal name: emphasis) by default. It uses similar way (index, length) to find and highlight the matches. The emphasis uses negative colors based on your PowerShell background and...","categories": [],
        "tags": ["powershell","string","regex"],
        "url": "/2018/05/grep-like-powershell-colorful-select-string.html",
        "teaser": null
      },{
        "title": "Converting Python json dict list to csv file in 2 lines of code by pandas",
        "excerpt":"Converting a Powershell object list to a csv file is quiet easy, for example : 6.0.2&gt; gps | select name,id,path | ConvertTo-Csv | Out-File .\\gps.csv ; ii .\\gps.csv I’ll show you in this post the Python way to convert a dict list to a csv file. During my work, I...","categories": [],
        "tags": ["python","json","csv"],
        "url": "/2018/06/converting-python-json-list-to-csv-in-2-lines-of-code-by-pandas.html",
        "teaser": null
      },{
        "title": "Import Python module with sys.path variable when without `__init__` file",
        "excerpt":"We’re familiar to put a python file inside a folder, and create a __init__.py file under the same folder, then we can easily import the file by import the folder, as the folder is transformed to a python module. But if we don’t have the __init__.py, how can we import...","categories": [],
        "tags": ["python","module"],
        "url": "/2018/06/import-python-module-with-sys-path-when-without-init-file.html",
        "teaser": null
      },{
        "title": "Git untrack submodule from git status",
        "excerpt":"When we have submodules in a git repo, even if we add the submodules’ folders into the .gitignore file, these submodules folders are still tracked from the git status output. Method 1: .gitmodules file There’re several methods to ignore it, one of them is in .gitmodules file, add following line...","categories": [],
        "tags": ["git","submodule"],
        "url": "/2018/06/git-untrack-submodule-from-git-status.html",
        "teaser": null
      },{
        "title": "Install Python on Windows with Powershell without administrator privileges",
        "excerpt":"As a Windows DevOps, I often use Powershell and Python, Powershell is installed by Windows out of box, but this is not for Python. And for my working environment, I don’t have the administrator privileges on some servers. I will show you in this post how to rapidly deploy Python...","categories": [],
        "tags": ["python","powershell","nuget","package"],
        "url": "/2018/06/install-python-on-windows-with-powershell-without-administrator-privileges.html",
        "teaser": null
      },{
        "title": "Use pyVmomi EventHistoryCollector to get all the vCenter events",
        "excerpt":"pyVmomi eventManager’s QueryEvents() method returns by default only the last 1000 events occurred on the vCenter. I will show you how to use another method CreateCollectorForEvents() to create an EventHistoryCollector object and then we use this object to collect all the events in a given time range by using its...","categories": [],
        "tags": ["python","pyvmomi","vmware"],
        "url": "/2018/07/use-pyvmomi-EventHistoryCollector-to-get-all-the-vcenter-events.html",
        "teaser": null
      },{
        "title": "Use python tabulate module to create tables",
        "excerpt":"If you want to create some tables from a python list, you can use the tabulate module, it can generate the table easily in text mode and in many formats, than you can past it into markdown, wiki files or add the print version to your python CLI in order...","categories": [],
        "tags": ["python","markdown","format"],
        "url": "/2018/07/use-python-tabulate-module-to-create-tables.html",
        "teaser": null
      },{
        "title": "Convert markdown or rst to Atlassian Confluance documentation format",
        "excerpt":"A recent working experience needed me to write doc on Atlassian Confluance documentation product. I will show you how to convert your markdown doc to Confluance version. Convert markdown or rst to Confluance Confluance’s web doc editor is very powerfull, but I a markdown guy, I write everything in markdown...","categories": [],
        "tags": ["markdown","format"],
        "url": "/2018/07/convert-markdown-or-rst-to-atlassian-confluance-documentation-format.html",
        "teaser": null
      },{
        "title": "Use Powershell to manage Windows Scheduled Task",
        "excerpt":"A recent project made me to use the Windows scheduled task to execute periodically some python scripts. After the project, I find using Powershell to manage the Windows scheduled task is not so straightforward, that’s why I opened this post to share my experience on some common usage, and hope...","categories": [],
        "tags": ["scheduled-task","powershell"],
        "url": "/2018/09/windows-scheduled-task-by-powershell.html",
        "teaser": null
      },{
        "title": "Install Gitlab-CE in Docker on Ubuntu",
        "excerpt":"Gitlab-CE (Community Edition) is a completely free and powerful web-based Git-repository manager with wiki, issue-tracking and CI/CD pipeline features, using an open-source license, developed by GitLab Inc. There’re already many much better docs on the net, I’ve never worked with Docker and Linux before, so I wrote this post to...","categories": [],
        "tags": ["gitlab","cicd","docker","ubuntu"],
        "url": "/2018/09/install-gitlab-ce-in-docker-on-ubuntu.html",
        "teaser": null
      },{
        "title": "Setup HTTPS for Gitlab",
        "excerpt":"Gitlab-CE default installation goes with HTTPS disable. We need to generate a SSL certificate, and bind it to the HTTPS of Gitlab-CE. Some docs on the Internet Gitlab omnibus SSL settings Gitlab omnibus enable HTTPS Generate a self-signed certificate with openssl How to install and configure Gitlab on Ubuntu 16.04...","categories": [],
        "tags": ["gitlab","cicd","certificate","openssl","ubuntu"],
        "url": "/2018/09/setup-https-for-gitlab.html",
        "teaser": null
      },{
        "title": "Install Gitlab Runner on Windows by Powershell PsRemoting",
        "excerpt":"Gitlab runner can be installed on Windows OS. For people like me who is more familiar with Windows, we would like to use Windows as a Gitlab runner. This post will give you a simplified procedure (winrm PsRemoting full command line) about its installation with some tips and tricks that...","categories": [],
        "tags": ["gitlab","cicd","powershell"],
        "url": "/2018/09/install-gitlab-runner-on-windows-by-powershell-psremoting.html",
        "teaser": null
      },{
        "title": "Backup and restore Gitlab in docker",
        "excerpt":"Gitlab hosts everything about the code including the docs and the pipeline data, etc. It’s crucial to back it up. You can also use restore to migrate the Gitlab to another server. This post will show you how to backup and restore the Gitlab-CE docker version. Some docs on the...","categories": [],
        "tags": ["gitlab","cicd","docker","backup","ubuntu"],
        "url": "/2018/09/backup-and-restore-gitlab-in-docker.html",
        "teaser": null
      },{
        "title": "Terminate Powershell script or session",
        "excerpt":"I always asked myself how to terminate a Powershell script or session, each time I needed to do some tests by myself and also searched on Google. But I could never remember it. So I would like to take this post to note it down, the next time I need...","categories": [],
        "tags": ["powershell"],
        "url": "/2018/09/terminate-powershell-script-or-session.html",
        "teaser": null
      },{
        "title": "Update Gitlab in docker",
        "excerpt":"Gitlab has several methods to update to newer version depending on the type of the original installation and the Gitlab version. This post will show you the way for docker version of Gitlab, which is the simplest among others. Some docs on the Internet This post will follow the official...","categories": [],
        "tags": ["gitlab","cicd","docker","update","ubuntu"],
        "url": "/2018/10/update-gitlab-in-docker.html",
        "teaser": null
      },{
        "title": "Migrate Gitlab in docker",
        "excerpt":"This post will walk you through the steps to migrate Gitlab from one docker container to another. The steps need you to know how to install a new Gitlab container and how to backup and restore Gitlab container, because the migration is just a restoration of a backup to another...","categories": [],
        "tags": ["gitlab","cicd","docker","migration","ubuntu"],
        "url": "/2018/10/migrate-gitlab-in-docker.html",
        "teaser": null
      },{
        "title": "Using Gitlab integrated CICD for Python project on Windows",
        "excerpt":"Gitlab ships with its own free CICD which works pretty well. This post will give you an example of the CICD file .gitlab-ci.yml for a Python project running on Gitlab Windows runner. Some docs on the Internet Official GitLab Continuous Integration (GitLab CI/CD) Official Configuration of your jobs with .gitlab-ci.yml...","categories": [],
        "tags": ["gitlab","cicd","python","powershell"],
        "url": "/2018/10/using-gitlab-integrated-cicd-for-python-project-on-windows.html",
        "teaser": null
      },{
        "title": "Setting Pwsh Invoke-WebRequest Proxy",
        "excerpt":"Different than Windows Powershell, Powershell Core doesn’t use the system proxy setting on Windows. This post will show you an one-line command to set Powershell Core web cmdlets proxy. My office working environment is behind an Internet proxy, and I use Scoop to install many dev tools on my Windows...","categories": [],
        "tags": ["powershell","proxy"],
        "url": "/2018/11/setting-pwsh-invoke-webrequest-proxy.html",
        "teaser": null
      },{
        "title": "Creating Multiple Redis Instance Services On Windows",
        "excerpt":"Even Salvatore Sanfilippo (creator of Redis) thinks it’s a bad idea to use multiple DBs in Redis. So we can install as many Redis instances as the number of DBs we need. This post will show you how to create multiple Redis instance as Windows service on the same Windows...","categories": [],
        "tags": ["powershell","service","redis"],
        "url": "/2018/11/creating-multiple-redis-instance-services-on-windows.html",
        "teaser": null
      },{
        "title": "Creating Custom Python Request Auth Class",
        "excerpt":"When you need to use a complicated, or a non-standard API authentication method, or your dev and prd environments don’t use the same API authentication method, it might be better to create a Python requests auth method to reduce your work. Create the class MyAuth Suppose you have an API...","categories": [],
        "tags": ["python","requests"],
        "url": "/2019/04/creating-custom-python-request-auth-class.html",
        "teaser": null
      },{
        "title": "Using Python SQLAlchemy session in multithreading",
        "excerpt":"SQLAlchemy DB session is not thread safe. In this post, I will show you 2 ways to use it in a multithreading context. Way 1 - Using contextmanager to create a session per thread Below is an example given by the official doc to show how to use the contextmanager...","categories": [],
        "tags": ["python","sqlalchemy","multithreading"],
        "url": "/2019/05/using-python-sqlalchemy-session-in-multithreading.html",
        "teaser": null
      },{
        "title": "Git Cheat Sheet",
        "excerpt":"This is not a complete Git cheat sheet for everyone, this is just a personal cheat sheet for some often forgotten git commands. Alias User level alias Edit ~/.gitconfig git config --global alias.st status git config --global alias.lga log --graph --decorate --oneline --all git config --global alias.co checkout git config...","categories": [],
        "tags": ["git"],
        "url": "/2019/06/git-cheat-sheet.html",
        "teaser": null
      },{
        "title": "Filtering In Pandas Dataframe",
        "excerpt":"Pandas dataframe is like a small database, we can use it to inject some data and do some in-memory filtering without any external SQL. This post is much like a summary of this StackOverflow thread. Building dataframe In [1]: import pandas as pd ...: import numpy as np ...: df...","categories": [],
        "tags": ["python","pandas","filtering"],
        "url": "/2019/07/filtering-pandas-dataframe.html",
        "teaser": null
      },{
        "title": "Troubleshooting Python Twine Cannot Upload Package On Windows",
        "excerpt":"Python has several tools to upload packages to PyPi or some private Artifactory locations. The mostly used one should be twine. Although twine is not a Python originate tool, but it’s officially recommended by Python.org. Building the package Just a quick callback on how to build the pacakge. We need...","categories": [],
        "tags": ["python","packaging"],
        "url": "/2019/07/troubleshooting-python-twine-cannot-upload-package-on-windows.html",
        "teaser": null
      },{
        "title": "A fast way to check TCP port in Powershell",
        "excerpt":"The Test-NetConnection cmdlet is great and verbose but too slow if the remote port to check is not opened. This is due to its timeout setting and cannot be modified. In this port, I will show you a custom function that leverages the power of System.Net.Sockets.TcpClient to accelerate the port...","categories": [],
        "tags": ["powershell","network"],
        "url": "/2019/09/fast-tcp-port-check-in-powershell.html",
        "teaser": null
      },{
        "title": "SQLAlchemy mixin in method",
        "excerpt":"If I’m not wrong, the SQLAlchemy official doc provides some examples to explain how to share a set of common columns, some common table options, or other mapped properties, across many classes. But I cannot find how to share common methods (e.g. your customized to_dict() method). This post will just...","categories": [],
        "tags": ["python","sqlalchemy"],
        "url": "/2019/09/sqlalchemy-mixin-in-method.html",
        "teaser": null
      },{
        "title": "Install Python3 on Ubuntu",
        "excerpt":"Most of tutorials on the Internet about installing Python3.6 on Ubuntu are by using 3rd party PPA repositories. If for any reason, you cannot use them, hereunder a quick tutorial for installing it from the Python official source, you should in advance download the source to the Ubuntu. Installing Python3.6...","categories": [],
        "tags": ["python","ubuntu"],
        "url": "/2019/10/installing-python3-on-ubuntu.html",
        "teaser": null
      },{
        "title": "Elastic Painless Scripted Field On Null/Missing Value",
        "excerpt":"This post shows how to use elastic painless language in scripted field to work on documents’ keys which might not exist in some documents. Parsing analyzed field in Painless Suppose we have following 2 documents in elastic: [{ \"kye1\": \"value1\", \"key2\": { \"key22\": \"value22\" } }, { \"key1\": \"valuex\" }]...","categories": [],
        "tags": ["elastic"],
        "url": "/2019/12/elastic-painless-scripted-field-on-null-or-mssing-value.html",
        "teaser": null
      },{
        "title": "Using Powershell To Retrieve Latest Package Url From Github Releases",
        "excerpt":"Github can host package releases, I will show you how to use Powershell to retrieve the latest release download url. Download latest Powershell release for Windows x64 zip version The goal of this demo is to convert the static url: https://github.com/PowerShell/PowerShell/releases/latest to the real download url (latest version on 2019/12/29):...","categories": [],
        "tags": ["powershell"],
        "url": "/2019/12/Using-Powershell-to-retrieve-latest-package-url-from-github-releases.html",
        "teaser": null
      },{
        "title": "Using Scoop On Windows",
        "excerpt":"I’ve been using Scoop for setting up my personal and professional Windows development desktops since nearly 2 years. For me, it’s much more useful than another famous Windows package management tool Chocolatey, because with Scoop, everything is run &amp; installed without any administrator privileges. This is very important in an...","categories": [],
        "tags": ["scoop","powershell"],
        "url": "/2019/12/Using-Scoop-On-Windows.html",
        "teaser": null
      },{
        "title": "Setting up WSL",
        "excerpt":"Cleaning up manually the WSL instance For any reason you failed to install WSL from Microsoft store, you might need to clean up manually the downloaded WSL instance, the default location is at: $env:LOCALAPPDATA\\Packages For example, Ubuntu v1804 is at: C:\\Users\\xiang\\AppData\\Local\\Packages\\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\\ Just delete the folder then reinstall it from Microsoft...","categories": [],
        "tags": ["wsl","linux"],
        "url": "/2020/02/setting-up-wsl.html",
        "teaser": null
      },{
        "title": "Flattening nested dict in Python",
        "excerpt":"Problem Given a nested dict with list as some keys’ value, we want to flatten the dict to a list. For example, given a dict as like: nested_data = { \"env\": [\"prd\", \"dev\"], \"os\": [\"win\", \"unx\"], \"msg\": \"ok\" } we want to convert it to a list as like: {'msg':...","categories": [],
        "tags": ["python","itertools"],
        "url": "/2020/03/flattening-nested-dict-in-python.html",
        "teaser": null
      },{
        "title": "Fixing an ipython Windows ConEmu only bug on 'MouseEventType.MOUSE_DOWN'",
        "excerpt":"Problem Previously I updated the python version, the ipython version and maybe ConEmu on my Windows 10 (I don’t remember which one exactly), I got an error when I wanted to copy some text from ipython repl in ConEmu console by the right mouse click: ps.7.0.0 | py.3.8.2❯ ipython Python...","categories": [],
        "tags": ["python","ipython"],
        "url": "/2020/04/fixing-ipython-on-Windows10-ConEmu-mouse-event-bug.html",
        "teaser": null
      },{
        "title": "Making isort compatible with black",
        "excerpt":"Update 2020-12-06, thanks to Christian Jauvin’s comment, since isort v5, it has introduced --profile=black option, so the life is much easier now:) Both isort and black are a must have in my python life, but with their default settings, I will get different imports formats. multi_line_output, include_trailing_comma and line_length The...","categories": [],
        "tags": ["python","format","vscode"],
        "url": "/2020/04/making-isort-compatible-with-black.html",
        "teaser": null
      },{
        "title": "Using Python Contextmanager To Create A Timer Decorator",
        "excerpt":"This stackoverflow post has already given an example on how to use contextmanager to create a timer decorator: from contextlib import contextmanager from timeit import default_timer @contextmanager def elapsed_timer(): start = default_timer() elapser = lambda: default_timer() - start yield lambda: elapser() end = default_timer() elapser = lambda: end-start It works...","categories": [],
        "tags": ["python","contextlib"],
        "url": "/2020/05/using-python-contextmanager-to-create-a-timer-decorator.html",
        "teaser": null
      },{
        "title": "Compiling SQLAlchemy query to nearly real raw sql query",
        "excerpt":"Some useful links https://stackoverflow.com/questions/5631078/sqlalchemy-print-the-actual-query https://docs.sqlalchemy.org/en/13/faq/sqlexpressions.html?highlight=literal_bind#rendering-bound-parameters-inline https://docs.sqlalchemy.org/en/13/core/engines.html#configuring-logging Query to compile Suppose we have a table called Movie, and a column release_date in the table Movie. &gt; from datetime import date &gt; from sqlalchemy import create_engine, sessionmaker &gt; engine = create_engine('sqlite:///moive_example.db') &gt; Session = sessionmaker(bind=engine) &gt; session = Session() &gt; filter1 =...","categories": [],
        "tags": ["python","sqlalchemy"],
        "url": "/2020/06/compiling-sqlalchemy-query-to-nearly-real-raw-sql-query.html",
        "teaser": null
      },{
        "title": "Rolling back from flask-restplus reqparse to native flask request to parse inputs",
        "excerpt":"flask-restplus’ (or flask-restx) reqparse module is deprecated, so I decided to use the native flask request object to parse the incoming inputs. After the try, I noticed some points to take care of. Before listing these points, I will show you how to use native flask request to parse the...","categories": [],
        "tags": ["python","flask"],
        "url": "/2020/07/rolling-back-from-flask-restplus-reqparse-to-native-flask-request-to-parse-inputs.html",
        "teaser": null
      },{
        "title": "My Powerline setup and configuration",
        "excerpt":"If you’re working in an enterprise environment, and you don’t have the admin rights on your Windows desktop to install additional fonts, or your enterprise admin cannot do that, then I suggest you to ignore this post, powerline will be installed, but very ugly. If you have a Linux desktop,...","categories": [],
        "tags": ["linux","wsl","shell"],
        "url": "/2020/11/my-powerline.html",
        "teaser": null
      },{
        "title": "Python Lint And Format",
        "excerpt":"Azure SDK Python Guidelines https://azure.github.io/azure-sdk/python_implementation.html Lint Update 2023-05-21: Replaced flake8, pylint, and isort by ruff. When replacing pylint, should add check by mypy. Update 2023-11-07: Bandit could be replaced by ruff too with the support of flake-bandit. The nearly only thing that ruff can not do for the moment is...","categories": [],
        "tags": ["python","format"],
        "url": "/2021/01/python-lint-and-format.html",
        "teaser": null
      },{
        "title": "Python Requests With Retry",
        "excerpt":"There’re several solutions to retry a HTTP request with Requests module, some of them are: Native Requests’ retry based on urllib3’s HTTPAdapter. Third party module: backoff. Third party module: tenacity. The native HTTPAdapter is not easy to use. The tenacity module is very powerful, but is also more or less...","categories": [],
        "tags": ["python","requests"],
        "url": "/2021/01/python-requests-with-retry.html",
        "teaser": null
      },{
        "title": "Trying Python pipreqs and pip-tools",
        "excerpt":"Relative to pipenv, and poetry, if you’re searching for some lightweight python package managers for a small project, I will introduce 2 handy tools for you: pipreqs and pip-tools. pipreqs pipreqs github Suppose you are onboarded to an existing project where only pip is used. The requirements.txt file is generated...","categories": [],
        "tags": ["python","pip"],
        "url": "/2021/03/trying-python-pipreqs-and-pip-tools.html",
        "teaser": null
      },{
        "title": "Python Unittest Cheet Sheet",
        "excerpt":"Python unittest and Pytest is a big deal, this post just gives some small &amp; quick examples on how to use Python unittest framwork, especially with Pytest framework. This post is not finished yet. pytest in Makefile # Makefile # https://github.com/databrickslabs/dbx/blob/main/Makefile SHELL=/bin/bash VENV_NAME := $(shell [ -d venv ] &amp;&amp;...","categories": [],
        "tags": ["python","unittest","pytest"],
        "url": "/2021/06/python-unittest-cheet-sheet.html",
        "teaser": null
      },{
        "title": "Python datetime utcnow",
        "excerpt":"Previously, when I needed a real UTC now with ISO 8601 format, I used to use the strftime function or the pytz module. But recently I just found that Python at least since v3.5 has already provide it with built-in module: datetime.now(timezone.utc), and this is also the preferred method over...","categories": [],
        "tags": ["python","datetime"],
        "url": "/2021/06/python-datetime-utc-now.html",
        "teaser": null
      },{
        "title": "Python Asyncio Study notes",
        "excerpt":"concurrent.futures   The concurrent.futures is a high-level abstraction for the threading and multiprocessing modules.     ","categories": [],
        "tags": ["python","async"],
        "url": "/2021/09/python-asyncio.html",
        "teaser": null
      },{
        "title": "Azure pipeline predefined variables",
        "excerpt":"The official doc gives an explanation of all the predefined variables, but it lacks of some concret examples. Hereunder some examples for my preferred variables. Access the predefined variables To access the variables value in YAML pipeline, we can use 2 methods: $(System.PullRequest.SourceBranch) : the standard way to access pipeline...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/01/azure-pipeline-predefined-variables.html",
        "teaser": null
      },{
        "title": "Azure pipeline reuse variables in template from another repository",
        "excerpt":"Context In my project, I have several Azure pipelines that share some same variables, instead of declaring them in each pipeline, I would like to refactor it by using some central places to store the shared variables. I can split the variables into 3 groups: organization level variables: organization name,...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/02/azure-pipeline-reuse-variables-in-template-from-another-repository.html",
        "teaser": null
      },{
        "title": "Azure pipeline checkout repository from another project",
        "excerpt":"Context This post can be an extend to my previous post on variables and templates reuse In fact, in addition to the variables and templates, I also need to reuse some non native Azure pipeline yaml files, for example some Python scripts defined in the shared template. If we use...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/02/azure-pipeline-checkout-repository-from-another-project.html",
        "teaser": null
      },{
        "title": "Azure pipeline variables and parameters",
        "excerpt":"Variable Variable scope When we set variables from a script, the new variable is only available from the next step, not the step where the variable is defined. variables: sauce: orange steps: # Create a variable - bash: | echo \"##vso[task.setvariable variable=sauce]crushed tomatoes\" # remember to use double quotes echo...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/03/azure-pipeline-variables-and-parameters.html",
        "teaser": null
      },{
        "title": "Manage Azure Databricks Service Principal",
        "excerpt":"Most of Databricks management can be done from the GUI or CLI, but for Azure Service Principal, we can only manage it by the SCIM API. There’s an open PR for adding support of SCIM API in Databricks CLI, but the lastest update is back to the beginning of 2021....","categories": [],
        "tags": ["azure","databricks"],
        "url": "/2022/03/manage-azure-databricks-service-principal.html",
        "teaser": null
      },{
        "title": "Azure Pipeline Checkout Multiple Repositories",
        "excerpt":"This post will talk about some Azure pipeline predefined variables’ values in a multiple repositories checkout situation. The official doc is here. The examples given in this post is using Azure DevOps repositories and Azure pipeline Ubuntu agent. Default Pipeline workspace structure When a pipeline starts, something is created inside...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/04/azure-pipeline-checkout-multiple-repositories.html",
        "teaser": null
      },{
        "title": "Using Databricks Connect inside a container",
        "excerpt":"Why use Databricks Connect From the very beginning of the Databricks Connect official doc, it says already that Databricks Connect has some limitations and is more or less deprecated in favor of dbx. But for some usages like local IDE live debug, Databricks Connect is still a very good tool...","categories": [],
        "tags": ["databricks","vscode","container","docker","spark"],
        "url": "/2022/06/using-databricks-connect-inside-a-container.html",
        "teaser": null
      },{
        "title": "Azure pipeline conditions",
        "excerpt":"Azure pipeline has two kinds of conditions: With keyword condition With jinja like format ${{if elseif else}} In both syntax, we have use parameters and variables, but there’s a big difference between them which makes DevOps frustrated. Conditions with keyword $ With ${{if elseif else}} condition, the using parameters and...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/07/azure-pipeline-conditions.html",
        "teaser": null
      },{
        "title": "Databricks job/task context",
        "excerpt":"Suppose we’re running following job/task in a Azure Databricks workspace: jobId: \"1111\" jobRunId: \"2222\" taskRunId: \"3333\" jobName: \"ths job name\" taskName: \"first-task\" databricksWorkspaceUrl: https://adb-4444444444.123.azuredatabricks.net/ Run below command in a Databricks job (task precisely): dbutils.notebook.entry_point.getDbutils().notebook().getContext().toJson() We will get following json: { \"rootRunId\": null, \"currentRunId\": null, \"jobGroup\": \"7777777777777777777_8888888888888888888_job-1111-run-3333-action-9999999999999999\", \"tags\": { \"jobId\": \"1111\",...","categories": [],
        "tags": ["databricks","azure"],
        "url": "/2022/07/databricks-job-context.html",
        "teaser": null
      },{
        "title": "Azure pipeline jobs",
        "excerpt":"Traditional jobs vs deployment jobs traditional jobs run in parallel, deployment jobs run in sequence, save the deployment history to a environment and a resource, and can also be applied with deployment strategy (runOnce, rolling, and the canary) Deployment jobs Tracking deployment history As per example given here: we can...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/08/azure-pipeline-jobs.html",
        "teaser": null
      },{
        "title": "Azure pipeline System.AccessToken in shared pipeline",
        "excerpt":"Var $(System.AccessToken) System.AccessToken is a special variable that carries the security token used by the running build. If you check the doc of job authorization scope, you might think the var $(System.AccessToken) has by default the access to all the repositories in the same project where hosts the calling Azure...","categories": [],
        "tags": ["azure","cicd"],
        "url": "/2022/09/azure-pipeline-system-access-token-in-shared-pipeline.html",
        "teaser": null
      },{
        "title": "Adding data files to Python package with setup.py",
        "excerpt":"setup.py vs pyproject.toml pyproject.toml is the new Python project metadata specification standard since PEP 621. As per PEP 517, and as per one of the comments of this StackOverflow thread, in some rare cases, we might have a chicken and egg problem when using setup.py if it needs to import...","categories": [],
        "tags": ["python","packaging"],
        "url": "/2022/09/adding-data-files-to-python-package-with-setup-py.html",
        "teaser": null
      },{
        "title": "Databricks cluster access mode",
        "excerpt":"What is cluster access mode Just a copy from Azure Databricks official doc: Amazon Databricks official doc has less info on access mode. Access Mode Visible to user UC Support Supported Languages Notes Single User Always Yes Python, SQL, Scala, R Can be assigned to and used by a single...","categories": [],
        "tags": ["azure","databricks","spark"],
        "url": "/2022/09/databricks-cluster-access-mode.html",
        "teaser": null
      },{
        "title": "Azure pipeline delete blobs from blob storage",
        "excerpt":"The example given by this post is for Azure Pipeline with the latest Ubuntu agent, for AzCli from local machine, removing the --auth-mode login part should work. As it’s a Linux pipeline agent, the pipeline task AzureFileCopy can not be used, it’s written in Powershell, we should use the AzureCLI...","categories": [],
        "tags": ["azure","cicd","storage"],
        "url": "/2022/11/azure-pipeline-delete-blobs-from-blob-storage.html",
        "teaser": null
      },{
        "title": "Azure pipeline Windows agent UnicodeEncodeError",
        "excerpt":"For people who encounter UnicodeEncodeError when using Windows Azure Pipeline agent, the issue might be here. As per above link, or this email, the solutions could be: You can override just sys.std* to UTF-8 by setting the environment variable PYTHONIOENCODING=UTF-8. You can override all I/O to use UTF-8 by setting...","categories": [],
        "tags": ["azure","cicd","codec"],
        "url": "/2022/11/azure-pipeline-windows-agent-UnicodeEncodeError.html",
        "teaser": null
      },{
        "title": "Using ast and cst to change Python code",
        "excerpt":"Difference between AST and CST A brief comparison could be found in the libcst doc. Generally speaking, CST could keep the original source code format including the comments. Using AST to change Python code Since Python 3.9, the helper ast.unparse has been introduced, so we have both ast.parse and ast.unparse...","categories": [],
        "tags": ["python","ast"],
        "url": "/2022/11/using-ast-and-cst-to-change-python-code.html",
        "teaser": null
      },{
        "title": "Python difference on subprocess run(), call(), check_call(), check_output()",
        "excerpt":"Difference on subprocess run(), call(), check_call(), check_output() Since Python 3.5, the official doc explains that: Prior to Python 3.5, these three functions (subprocess.call(), subprocess.check_call(), subprocess.check_output()) comprised the high level API to subprocess. You can now use subprocess.run() in many cases, but lots of existing code calls these functions. subprocess.run common...","categories": [],
        "tags": ["python"],
        "url": "/2022/12/python-difference-on-subprocess-run-call-check-call-check-output.html",
        "teaser": null
      },{
        "title": "Syncing repository from github to gitee",
        "excerpt":"I need to sync github repository (files and commits only) https://github.com/copdips/copdips.github.io to gitee repository https://gitee.com/copdips/copdips.github.io. In gitee: create an empty repository, normal the same name as the one you want to sync from github. For example for this blog repository: https://gitee.com/copdips/copdips.github.io In gitee: create a PAT in gitee with necessary...","categories": [],
        "tags": ["git"],
        "url": "/2022/12/syncing-repository-from-github-to-gitee.html",
        "teaser": null
      },{
        "title": "Python aiohttp rate limit",
        "excerpt":"HTTP rate limit is often the max requests in a limited time period, and sometimes could also be the max concurrent requests. Max requests in a limited time period from aiolimiter import AsyncLimiter RATE_LIMIT_IN_SECOND = 20 # 1.0 for time period during 1 second rate_limit = AsyncLimiter(RATE_LIMIT_IN_SECOND, 1.0) async with...","categories": [],
        "tags": ["python","async"],
        "url": "/2023/01/python-aiohttp-rate-limit.html",
        "teaser": null
      },{
        "title": "Calling Azure REST API",
        "excerpt":"This blog Calling Azure REST API via curl is pretty good. Just two more things. Auth token in curl We can use curl -X GET -u :$token instead of curl -X GET -H \"Authorization: Bearer $token\" Azure DevOps API resource id for OAuth when using az rest to call Azure...","categories": [],
        "tags": ["azure","api","rest"],
        "url": "/2023/01/calling-azure-rest-api.html",
        "teaser": null
      },{
        "title": "Sonarcloud Github Action",
        "excerpt":"Sonarcloud Github Action doesn’t work by default with Python pytest coverage.xml file, hereunder a working example. file .github/workflows/ci.yml # file: .github/workflows/ci.yml # irrelevant part is removed env: repo_name: repo app_folder_name: app coverage_percent: 90 build_number: ${{ github.run_number }} pytest_coverage_commentator_filename: pytest_coverage_commentator.txt pytest_coverage_xml_file_name: coverage.xml - name: Test with pytest run: | pytest -v...","categories": [],
        "tags": ["githubaction","sonar","cicd"],
        "url": "/2023/01/sonarcloud-github-action.html",
        "teaser": null
      },{
        "title": "Python Asyncio Unittest",
        "excerpt":"Unittest based on Pytest framework not embedded unittest. Mocking async http client aiohttp.ClientSession Source code # file path: root/module_name/foo.py # pip install aiohttp import aiohttp class ClassFoo: def __init__(self, access_token: str): self.access_token = access_token self.auth_header = {\"Authorization\": f\"Bearer {self.access_token}\"} self.base_url = \"https://foo.bar.com/api/v1\" async def get_foo(self, foo_id: str) -&gt; dict: url...","categories": [],
        "tags": ["python","async","pytest","unittest"],
        "url": "/2023/07/python-asyncio-unittest.html",
        "teaser": null
      },{
        "title": "Different ssh keys for different github.com accounts",
        "excerpt":"It might be a common case that you have multiple github.com accounts (personal and professional), and you want to use different ssh keys for different github accounts, as github.com does not allow same ssh key for different accounts with “Key is already in use” error. To achieve this, you could...","categories": [],
        "tags": ["git","ssh"],
        "url": "/2023/09/different-ssh-keys-for-different-github.com-accounts.html",
        "teaser": null
      },{
        "title": "Python Asyncio",
        "excerpt":"This is not a Python asyncio tutorial. Just some personal quick tips here, and could be updated from time to time. greenlet vs gevent greenlet needs manual event switch. gevent is based on greenlet. gevent has gevent.monkey.patch_all(). @asyncio.coroutine From Python 3.8, async def deprecates @asyncio.coroutine yield from From Python 3.5,...","categories": [],
        "tags": ["python","async"],
        "url": "/2023/09/python-asyncio.html",
        "teaser": null
      },{
        "title": "Github Actions - Cache",
        "excerpt":"Life span Github Actions cache has a life span of 7 days, and the total size of all caches in a repository is limited to 10 GB. Standard Cache Cache key should be as specific as possible, so that the post cache restore installation can be reduced or skipped. For...","categories": [],
        "tags": ["cicd","githubaction","cache","azure"],
        "url": "/2023/09/github-actions-cache.html",
        "teaser": null
      },{
        "title": "Github Actions - Custom Actions",
        "excerpt":"Actions checkout location in workflow Actions are automatically checked out by Github Action from the beginning of a workflow run, the checkout path could be found by: env var $GITHUB_ACTION_PATH, github context ${{ github.action_path }}. This is very useful when you need to reference some files or scripts saved in...","categories": [],
        "tags": ["cicd","githubaction","azure"],
        "url": "/2023/09/github-actions-custom-actions.html",
        "teaser": null
      },{
        "title": "Github Actions - Environment",
        "excerpt":"Dynamic environment environment is set at job level (not at step level), so we should use the $GITHUB_OUTPUT context to set the environment name dynamically, see here to learn how to pass data between jobs. Standard usage for static value is like this: jobs: deployment: runs-on: ubuntu-latest environment: production steps:...","categories": [],
        "tags": ["cicd","githubaction"],
        "url": "/2023/09/github-actions-environment.html",
        "teaser": null
      },{
        "title": "Github Actions - Variables",
        "excerpt":"Variables upon Git events Suppose we create a new branch named new_branch, and create a pull request (with id 123) from the new branch new_branch to the main branch. During the pipeline, we can see following predefined variables in different GIT events. Check here for variables upon git events in...","categories": [],
        "tags": ["cicd","githubaction"],
        "url": "/2023/09/github-actions-variables.html",
        "teaser": null
      },{
        "title": "Github Actions - Error handling",
        "excerpt":"continue-on-error vs fail-fast The doc explains that continue-on-error applies to a single job or single step which defines whether a job or step can continue on its error, while fail-fast applies to the entire matrix which means if the failure of a job in the matrix can stop other running...","categories": [],
        "tags": ["cicd","githubaction"],
        "url": "/2023/09/github-actions-error-handling.html",
        "teaser": null
      },{
        "title": "Github Actions - Workflows",
        "excerpt":"Reusable workflows Re-run a reusable workflow If reusable workflow is not referenced by SHA, for example a branch name, when re-run a workflow, it will not use the latest version of the workflow in that branch, but the same commit SHA of the first attempt. Which means, if you use...","categories": [],
        "tags": ["cicd","githubaction"],
        "url": "/2023/09/github-actions-workflows.html",
        "teaser": null
      },{
        "title": "Databricks Python pip authentication",
        "excerpt":"Before the Databricks Unit Catalog’s release, we used init scripts to generate the pip.conf file during cluster startup, allowing each cluster its unique auth token. But with init scripts no longer available in the Unit Catalog’s shared mode, an alternative approach is required. A workaround involves placing a prepared pip.conf...","categories": [],
        "tags": ["databricks","python","pip","auth"],
        "url": "/2023/09/databricks-python-pip-authentication.html",
        "teaser": null
      },{
        "title": "Github Actions - Python",
        "excerpt":"Setting up pip authentication PIP_INDEX_URL vs PIP_EXTRA_INDEX_URL In most cases, when setting up private Python package artifacts (like Azure DevOps Artifacts, JFrog Artifactory, etc.) are configured to mirror the public PyPi. In such scenarios, we only need to use PIP_INDEX_URL to point to these private artifacts. However, some people might...","categories": [],
        "tags": ["cicd","githubaction","python","pip","auth","azure"],
        "url": "/2023/09/github-actions-python.html",
        "teaser": null
      },{
        "title": "Github Actions - copdips/get-azure-keyvault-secrets-action",
        "excerpt":"Recently, I began a new project that requires migrating some process from Azure Pipelines to Github Actions. One of the tasks involves retrieving secrets from Azure Key Vault. In Azure Pipelines, we have an official task called AzureKeyVault@2 designed for this purpose. However, its official counterpart in Github Actions, Azure/get-keyvault-secrets@v1,...","categories": [],
        "tags": ["cicd","githubaction","python","async","azure","vault"],
        "url": "/2023/10/github-actions-get-azure-keyvault-secrets-action.html",
        "teaser": null
      },{
        "title": "Hashing files",
        "excerpt":"During CI/CD processes, and particularly during CI, we frequently hash dependency files to create cache keys (referred to as key input in Github Action actions/cache and key parameter in Azure pipelines Cache@2 task). However, the default hash functions come with certain limitations like this comment. To address this, we can...","categories": [],
        "tags": ["cicd","githubaction","azure","shell","cache"],
        "url": "/2023/10/hashing-files.html",
        "teaser": null
      },{
        "title": "Github Actions - Bash shell -e -o pipefail",
        "excerpt":"Bash shell in Github actions by default is run with -e -o pipefail option. The full command used by Github actions is : shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0} -o pipefail means that if any command in a pipeline fails, that return code will be used as the...","categories": [],
        "tags": ["cicd","githubaction","shell"],
        "url": "/2023/11/github-actions-bash-shell-pipefail.html",
        "teaser": null
      },{
        "title": "Some nice cicd bash common scripts",
        "excerpt":"During CICD, we often have a large log output, it might be nice to have some common scripts to help us to format the log output, so that we can easily find the information we need. Recently, when working with Sonar, I found that they have some scripts for such...","categories": [],
        "tags": ["cicd","githubaction","azure","shell"],
        "url": "/2023/11/Some-nice-CICD-bash-common-scripts.html",
        "teaser": null
      },{
        "title": "Github actions - deploy static files to azure web app",
        "excerpt":"Although Azure provides already a GitHub Actions for Azure Web App to deploy static files to Azure Web App, but we can also do it ourselves with a azure cli command. Suppose the static files are generated in a folder named site, then the above Azure doc says we can...","categories": [],
        "tags": ["cicd","githubaction","azure"],
        "url": "/2023/11/github-actions-deploy-static-files-to-azure-web-app.html",
        "teaser": null
      }]
