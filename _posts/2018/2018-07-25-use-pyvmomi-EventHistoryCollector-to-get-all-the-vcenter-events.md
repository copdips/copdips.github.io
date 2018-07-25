---
title: "Use pyVmomi EventHistoryCollector to get all the vCenter events"
excerpt: "pyVmomi event manager returns only the last 1000 events. But EventHistoryCollector object's ReadNextEvents()method can collect all the events."
tags:
  - python
  - pyvmomi
  - vmware
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

> pyVmomi eventManager's QueryEvents() method returns by default only the last 1000 events occurred on the vCenter. I will show you how to use another method CreateCollectorForEvents() to create an EventHistoryCollector object and then we use this object to collect all the events in a given time range by using its method ReadNextEvents().

# An example of QueryEvents method from the eventManager object

Let's see [an example](https://github.com/vmware/pyvmomi-community-samples/blob/master/samples/relocate_events.py#L66) given by the pyVmomi samples community.

```python
# ...some code ignored...
byEntity = vim.event.EventFilterSpec.ByEntity(entity=vm, recursion="self")
ids = ['VmRelocatedEvent', 'DrsVmMigratedEvent', 'VmMigratedEvent']
filterSpec = vim.event.EventFilterSpec(entity=byEntity, eventTypeId=ids)
# ...some code ignored...
eventManager = si.content.eventManager
events = eventManager.QueryEvent(filterSpec)
# ...some code ignored...
```

From the above code example, we can find that the author wants to collect the vCenter events where the event types are limited to `ids` and the event entity is limited to `byEntity`. He creates a [filterSpec](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.vspsdk.apiref.doc/vim.event.EventFilterSpec.html) based on these 2 limitations and creates an [eventManager](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.vspsdk.apiref.doc/vim.event.EventManager.html) object, than passes the filterSpec to the method [QueryEvent](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.vspsdk.apiref.doc/vim.event.EventManager.html) to collect the events.

The code works well, but you will find that in anyway, it will only returns maximum 1000 events. This is because eventManger uses the default event collector which pages all the events in a size of 1000 events (by default and also the maximum value) per page, and returns only the [last page](https://pubs.vmware.com/vsphere-6-5/index.jsp?topic=%2Fcom.vmware.vspsdk.apiref.doc%2Fvim.event.EventManager.html&resultof=%22%65%76%65%6e%74%6d%61%6e%61%67%65%72%22%20%22%65%76%65%6e%74%6d%61%6e%61%67%22%20).

# An example of Get-VIEvent from PowerCLI

In PowerCLI, we have the cmdlet [Get-VIEvent
](http://pubs.vmware.com/vsphere-6-5/topic/com.vmware.powercli.cmdletref.doc/Get-VIEvent.html) which can get all the events without the limitation of 1000 events.

```powershell
Connect-VIServer -Server 10.23.113.41
$events = Get-VIEvent -Start (Get-Date).AddDays(-1)
```

It works perfectly, but please take care of this site note:

"Calling Get-VIEvent without any parameters might result in significant delays depending on the total number of events on the server."
{: .notice--info}

This note tells us that the cmdlet might take a long time to finish if there're too many events. In fact, that is also what I will show you in the below paragraph, Get-VIEvent uses the [EventHistoryCollector](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.vspsdk.apiref.doc/vim.event.EventHistoryCollector.html) to walk through all the events pages, and returns them all in the end.

# Use EventHistoryCollector to collect all the events

Finally, here comes our protagonist, the [EventHistoryCollector](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.vspsdk.apiref.doc/vim.event.EventHistoryCollector.html).

The EventHistoryCollector can be created by eventManger by using the `CreateCollectorForEvents(filter)` method. The EventHistoryCollector has a magic method: `ReadNextEvents()`.

> ReadNextEvents
>
> Reads the 'scrollable view' from the current position. The scrollable position is moved to the next newer page after the read. No item is returned when the end of the collector is reached.

From it's description, we can know that it reads all the events from the current page, than it jumps to the next page. EventHistoryCollector has also a `ReadPreviousEvents()` method that does exactly the same thing but jumps back to the previous page.

**So, now we need to ensure from where (which event page) starting the EventHistoryCollector.**

From the [EventHistoryCollector doc](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.vspsdk.apiref.doc/vim.event.EventHistoryCollector.html), we find it inherits from HistoryCollector:

> Managed Object - EventHistoryCollector(vim.event.EventHistoryCollector)
>
> Returned by
>
>     CreateCollectorForEvents
>
> Extends
>
>     HistoryCollector


A quick search on [HistoryCollector](https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.wssdk.smssdk.doc/vim.HistoryCollector.html), we find it has a method `RewindCollector()`:

>RewindCollector(rewind)
>
>Moves the "scrollable view" to the oldest item. If you use ReadNextTasks or ReadNextEvents, all items are retrieved from the oldest item to the newest item. **This is the default setting when the collector is created**.

The last sentence tells us that the default starting page of the EventHistoryCollector is the oldest one, or we can call it the first page in an human readable manner, so we can use `ReadNextEvents()` to read all the events page by page.

If you want to set the EventHistoryCollector's starting point to the newest page (the last page), you can use the `ResetCollector(reset)` method.
{: .notice--info}

Finally, hereunder the sample code to collect all the vCenter events in the past hour:

{% highlight python linenos %}
from datetime import datetime, timedelta

from pyVim.connect import SmartConnectNoSSL
from pyVmomi import vim


time_filter = vim.event.EventFilterSpec.ByTime()
now = datetime.now()
time_filter.beginTime = now - timedelta(hours=1)
time_filter.endTime = now
event_type_list = []
# If you want to also filter on certain events, uncomment the below event_type_list.
# The EventFilterSpec full params details:
# https://pubs.vmware.com/vsphere-6-5/topic/com.vmware.wssdk.smssdk.doc/vim.event.EventFilterSpec.html
# event_type_list = ['VmRelocatedEvent', 'DrsVmMigratedEvent', 'VmMigratedEvent']
filter_spec = vim.event.EventFilterSpec(eventTypeId=event_type_list, time=time_filter)

si = SmartConnectNoSSL(host=host, user=user, pwd=password, port=port)
eventManager = si.content.eventManager
event_collector = eventManager.CreateCollectorForEvents(filter_spec)
page_size = 1000 # The default and also the max event number per page till vSphere v6.5, you can change it to a smaller value by SetCollectorPageSize().
events = []

while True:
  # If there's a huge number of events in the expected time range, this while loop will take a while.
  events_in_page = event_collector.ReadNextEvents(page_size)
  num_event_in_page = len(events_in_page)
  if num_event_in_page == 0:
    break
  events.extend(events_in_page) # or do other things on the collected events
# Please note that the events collected are not ordered by the event creation time, you might find the first event in the third page for example.

print(
    "Got totally {} events in the given time range from {} to {}.".format(
        len(events), time_filter.beginTime, time_filter.endTime
    )
)
{% endhighlight %}
