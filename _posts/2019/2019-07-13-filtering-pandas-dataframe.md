---
title: "Filtering In Pandas Dataframe"
excerpt: "Filtering a pandas dataframe with series, query, or numpy methods."
tags:
  - python
  - pandas
  - filtering
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

> Pandas dataframe is like a small database,
> we can use it to inject some data and do some in-memory filtering without any external SQL.
> This post is much like a summary of this [StackOverflow thread](https://stackoverflow.com/questions/17071871/select-rows-from-a-dataframe-based-on-values-in-a-column-in-pandas).

## Building dataframe

```python
In [1]: import pandas as pd
   ...: import numpy as np
   ...: df = pd.DataFrame({'A': 'foo bar foo bar foo bar foo foo'.split(),
   ...:                    'B': 'one one two three two two one three'.split(),
   ...:                    'C': np.arange(8), 'D': np.arange(8) * 2})

In [2]: df
Out[2]:
     A      B  C   D
0  foo    one  0   0
1  bar    one  1   2
2  foo    two  2   4
3  bar  three  3   6
4  foo    two  4   8
5  bar    two  5  10
6  foo    one  6  12
7  foo  three  7  14
```

## Some basic filtering conditions

### Filtering by A = 'foo'

```python
In [3]: df[df.A == 'foo']
Out[3]:
     A      B  C   D
0  foo    one  0   0
2  foo    two  2   4
4  foo    two  4   8
6  foo    one  6  12
7  foo  three  7  14
```

### Filtering by A = 'foo' and B = 'one'

```python
In [4]: df[(df.A == 'foo') & (df.B == 'one')]
Out[4]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Filtering by A = 'foo' or B = 'one'

```python
In [5]: df[(df.A == 'foo') | (df.B == 'one')]
Out[5]:
     A      B  C   D
0  foo    one  0   0
1  bar    one  1   2
2  foo    two  2   4
4  foo    two  4   8
6  foo    one  6  12
7  foo  three  7  14
```

## Different ways to achieve the same filtering

> Let's take the example for filtering by `A = 'foo' and B = 'one'`

### Column as dataframe property

```python
In [4]: df[(df.A == 'foo') & (df.B == 'one')]
Out[4]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Column as dataframe dict key

```python
In [7]: df[(df['A'] == 'foo') & (df['B'] == 'one')]
Out[7]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using multiple single filters

```python
In [16]: df[df.A == 'foo'][df.B == 'one']
C:\Users\xiang\AppData\Local\PackageManagement\NuGet\Packages\python.3.7.0\tools\Scripts\ipython:1: UserWarning: Boolean Series key will be reindexed to match DataFrame index.
Out[16]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using numpy array

```python
In [24]: df[(df.A.values == 'foo') & (df.B.values == 'one')]
Out[24]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using isin function

```python
In [9]: df[( df['A'].isin(['foo']) ) & ( df['B'].isin(['one']) )]
Out[9]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using underlying numpy in1d function

```python
In [25]: df[(np.in1d(df['A'].values, ['foo'])) & (np.in1d(df['B'].values, ['one']))]
Out[25]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using query API (developer friendly)

```python
In [10]: df.query("(A == 'foo') & (B == 'one')")
Out[10]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using numpy where function and dataframe iloc positional indexing

```python
In [20]: df.iloc[np.where( (df.A.values=='foo') & (df.B.values=='one') )]
Out[20]:
     A    B  C   D
0  foo  one  0   0
6  foo  one  6  12
```

### Using xs label indexing

The Syntax is too complicated.

## Developer friendly filtering

As mentioned previously, the [query API method](https://copdips.com/2019/07/filtering-pandas-dataframe.html#using-query-api-developer-friendly) is a developer friendly filtering method.

Why? All the other methods must include the original `df` object in the filter. If we have a dynamic filter conditions, it will be difficult to generate the filters ([pandas Series](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.Series.html?highlight=series)) with the `df` object. I haven't found the solution to build this kind of filter by looping over a Python dict.

For example:

The filter is based on a Python dict, `the key of the dict` corresponds to the dataframe column, and `the value of the dict` corresponds to the value to dataframe column value to filter. One more context, if the value is None, don't filter on the corresponding key (column).

Suppose the filter dict is like this one:

```python
filter_dict = {'A': 'foo', 'B': 'one', 'C': None, 'D': None}
```

By using `df` object in the filter, we should see something like this:

```python
df[(df['A'] == 'foo') & (df['B'] == 'one')]
```

It's easy to type manually the filter directly from a shell (ipython or jupyter as you like), but how you build the same filter from a Python script ? Not simple.

> Please let me know if you have any suggestions :)

But with the query API, we just need to convert the `filter_dict` to a string like: `"(A == 'foo') & (B == 'one')"`. This is pretty easy in pure Python:

```python
In [32]: filter_dict = {'A': 'foo', 'B': 'one', 'C': None, 'D': None}

In [33]: filter_string = " & ".join(["{} == '{}'".format(k,v) for k,v in filter_dict.items() if v is not None])

In [34]: filter_string
Out[34]: "A == 'foo' & B == 'one'"}
```

## Benchmark

You can get the benchmark from this [StackOverflow thread](https://stackoverflow.com/a/46165056).

Generally speaking, except for `the query API` and `the xs label indexing` methods, all the others are fast.

But for a large quantity of data, the query API becomes pretty fast.
{: .notice--info}

Some benchmarks I tested from my laptop:

### For 8 lines of data

```python
In [35]: import pandas as pd
   ...: import numpy as np
   ...: df = pd.DataFrame({'A': 'foo bar foo bar foo bar foo foo'.split(),
   ...:                    'B': 'one one two three two two one three'.split(),
   ...:                    'C': np.arange(8), 'D': np.arange(8) * 2})

In [36]: %timeit df.query("(A == 'foo') & (B == 'one')")
1.48 ms ± 35.1 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

In [37]: %timeit df[df.A == 'foo'][df.B == 'one']
1.01 ms ± 33.7 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

In [38]: %timeit df[(df.A == 'foo') & (df.B == 'one')]
688 µs ± 48.3 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

In [39]: %timeit df[(df.A.values == 'foo') & (df.B.values == 'one')]
248 µs ± 15 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

In [40]: %timeit df.iloc[np.where( (df.A.values=='foo') & (df.B.values=='one') )]
287 µs ± 20.8 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)
```

### For 30k lines of data

```python
In [51]: import pandas as pd
    ...: import numpy as np
    ...: df = pd.DataFrame({'A': ('foo bar ' * 15000).split(),
    ...:                    'B': ('one one two two three three ' * 5000).split(),
    ...:                    'C': np.arange(30000), 'D': np.arange(30000) * 2})

In [52]: %timeit df.query("(A == 'foo') & (B == 'one')")
2.83 ms ± 373 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)

In [53]: %timeit df[df.A == 'foo'][df.B == 'one']
6.51 ms ± 230 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)

In [54]: %timeit df[(df.A == 'foo') & (df.B == 'one')]
5.58 ms ± 480 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)

In [55]: %timeit df[(df.A.values == 'foo') & (df.B.values == 'one')]
1.47 ms ± 58 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

In [56]: %timeit df.iloc[np.where( (df.A.values=='foo') & (df.B.values=='one') )]
1.5 ms ± 38.5 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)
```
