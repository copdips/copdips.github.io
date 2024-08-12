---
authors:
- copdips
categories:
- azure
comments: true
date:
  created: 2024-08-12
---

# Azure Data Factory - ForEach Activity

The `ForeEach` activity in Azure Data Factory has some important [limitations](https://learn.microsoft.com/en-us/azure/data-factory/control-flow-for-each-activity#limitations-and-workarounds).
One of them is when working with the `batch` mode, it would be nice to embed only pipeline activities inside.

<!-- more -->

## Problem

When you run the `ForEach` activity in `batch` mode, and you loop over a list of items, and inside the `ForEach`, you run some activities (not pipeline activity), you might find the same item is processed multiple times.
The [doc](https://learn.microsoft.com/en-us/azure/data-factory/control-flow-for-each-activity#limitations-and-workarounds) already says that the `SetVariable` should not be used in the ForEach activity, as it will set the variable at pipeline level (the pipeline where hosts the ForEach activity), and it will be shared by all the iterations.

## Solution

There are 2 solutions to this problem:

1. If you want to keep the `batch` mode, use the ForEach activity with pipeline activity inside only, and send the item to the pipeline as a parameter. Pipeline is more a less like a function in programming, each batch (and the item sent by the ForEach activity) is run in an isolated pipeline, so the variables defined in the pipeline is not shared with other batch (pipeline). This solution takes more time in authoring your ADF workflow, but it's faster in execution.
2. Or set the ForEach activity to `sequential` mode, then everything will work as expected, but it will be much slower.
