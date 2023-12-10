---
title: "Elastic Painless Scripted Field On Null/Missing Value"
excerpt: "How to use painless scripted field to working on objects which might be null or missing in some documents."
tags:
  - elastic
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



This post shows how to use elastic painless language in scripted field to work on documents' keys which might not exist in some documents.

## Parsing analyzed field in Painless

Suppose we have following 2 documents in elastic:


```json
[{
    "kye1": "value1",
    "key2": {
        "key22": "value22"
    }
}, {
    "key1": "valuex"
}]
```

The key `key22` in the first document can be accessed by `doc['key2.key22'].value`. If we use this script in the scripted field, we will see a null value for all the documents. This is because the second document doesn't have the key `key22`, painless language will throw an error. This [github issue](https://github.com/elastic/elasticsearch/issues/33816) is discussing how to return a default value if it is missing.

To workaround this, I found a solution from this [github issue](https://github.com/elastic/elasticsearch/issues/24125#issuecomment-375874356). We should check the null value each time.

The script should be:

```json
(params._source.key2 == null) ? '' : ( (params._source.key2.key22 == null) ? '' : (params._source.key2.key22) ))
```

Parsing documents by `params._source` is [very slow](https://findingdata.rocks/elasticsearch-scripting-understanding-the-difference-between-doc-and-params/). It's not cached, and is calculated in real-time each time.
{: .notice--warning}

The fields calculated by the scripted field is not searchable.
{: .notice--warning}
