---
title: "Converting Python json dict list to csv file in 2 lines of code by pandas"
excerpt: "One of the fastest way to convert Python json dict list to csv file with only 2 lines of code by pandas"
tags:
  - python
  - json
  - csv
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

> Converting a Powershell object list to a csv file is quiet easy, for example :
> ```powershell
> 6.0.2> gps | select name,id,path | ConvertTo-Csv | Out-File .\gps.csv ; ii .\gps.csv
> ````
> I'll show you in this post the Python way to convert a dict list to a csv file.

During my work, I got a result in Python dict list type, I needed to send it to other teams who are not some Python guys. One of the most commonly used sharing file type is the [csv file](https://fr.wikipedia.org/wiki/Comma-separated_values). When I googled how to convert json to csv in Python, I found many ways to do that, but most of them need quiet a lot of code to accomplish this common task. I was a sysadmin, I don't like to write many lines for a single task, and I also don't like to reinvent the wheel. Finally, I found the [Python pandas module](https://pandas.pydata.org/) which lets me to achieve this goal in only 2 lines of code.

> pandas is an open source, BSD-licensed library providing high-performance, easy-to-use data structures and data analysis tools for the Python programming language.

Here's the code :

```python
>>> import json

# first line of code: import the pandas module
>>> import pandas

# generate a python dict list
>>> data= [{'name':'a', 'value':1}, {'name':'b', 'value':2}]

# second line of code: convert the dict list to csv and save it into the file pandas.csv
>>> pandas.read_json(json.dumps(data)).to_csv('pandas.csv')

# verify the csv file content
>>> with open('pandas.csv') as f:
...     print(f.read())
,name,value
0,a,1
1,b,2
```
