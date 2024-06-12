---
authors:
- copdips
categories:
- python
- debug
comments: true
date:
  created: 2024-06-12
---

# Profiling Python code

| Name                                                                                       | Scope                          | web framework middleware                                       | VSCode Extension                                                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [scalene](https://github.com/plasma-umass/scalene)                                         | ==cpu, gpu, memory==, duration | [partially](https://github.com/plasma-umass/scalene/issues/35) | [yes](https://marketplace.visualstudio.com/items?itemName=EmeryBerger.scalene)             |
| [cProfile](https://docs.python.org/3/library/profile.html)<br>(Python native, function level only and cli only) | duration                       | no                                                             | no                                                                                         |
| [VizTracer](https://github.com/gaogaotiantian/viztracer)                                   | duration                       | unknown                                                        | [yes](https://marketplace.visualstudio.com/items?itemName=gaogaotiantian.viztracer-vscode) |
| [profyle](https://github.com/vpcarlos/profyle)<br>(based on Viztracer)                     | duration                       | yes                                                            | no                                                                                         |
| [pyinstrument](https://github.com/joerick/pyinstrument)                                    | duration                       | yes                                                            | no                                                                                         |
| [py-spy](https://github.com/benfred/py-spy)                                                | duration                       | no                                                             | no                                                                                         |
| [yappi](https://github.com/sumerc/yappi)<br>(cli only)                                     | duration                       | unknown                                                        | no                                                                                         |
| [austin](https://github.com/P403n1x87/austin)                                              | duration                       | unknown                                                        | [yes](https://marketplace.visualstudio.com/items?itemName=p403n1x87.austin-vscode)         |

Interesting reading:

- [\[2023\] Profiling in Python: How to Find Performance Bottlenecks](https://realpython.com/python-profiling/)
- [\[2023\]\[Podcast\] Measuring Multiple Facets of Python Performance With Scalene](https://realpython.com/podcasts/rpp/172/)
- [\[2019\]\[PDF\] A Survey of Open-Source Python Profilers by Peter Norton](https://www.usenix.org/system/files/login/articles/login_winter19_12_norton.pdf)
- [\[2020\] Why you should try VizTracer to understand your python program](https://gaogaotiantian.medium.com/why-you-should-try-viztracer-to-understand-your-python-program-9e08ccbd5e97)
- [\[2023\] How to Profile Asyncio Programs with cProfile](https://superfastpython.com/profile-asyncio-programs/)

<!-- more -->
