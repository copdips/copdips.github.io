---
title: "Convert markdown or rst to Atlassian Confluance documentation format"
excerpt: "Atlassian Confluance is not fully markdown friendly yet, to versioning your doc in pure text mode, you can use html format as a bridge."
tags:
  - markdown
  - format
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

> A recent working experience needed me to write doc on Atlassian Confluance documentation product. I will show you how to convert your markdown doc to Confluance version.

# Convert markdown or rst to Confluance

Confluance's web doc editor is very powerfull, but I a markdown guy, I write everything in markdown in pure text mode and versioning it. I need sth. to convert markdown to Confluance.

Checked on [the official doc](https://confluence.atlassian.com/doc/confluence-wiki-markup-251003035.html#ConfluenceWikiMarkup-markdownCanIinsertmarkdown?), it says that Confluence supports markdown import, but after a test, not really, at least not for table.

**Solution:**

Convert the markdown or rst files to a HTML file.

There're many plugins on the net, I use VSCode editor, I choose the extension [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one), it has a method called "Markdown: Print current document to HTML".

Once I get the HTML version, than just past the HTML content into Confluence directly. Done.

Here's [the tutorial on how to insert the HTML marco](https://confluence.atlassian.com/doc/html-macro-38273085.html).


# Convert mediawiki to Confluance

Checked on [the official doc](https://confluence.atlassian.com/doc/confluence-wiki-markup-251003035.html#ConfluenceWikiMarkup-CanItypewikimarkupintotheeditor?), it says that Confluence supports wiki import, but I haven't tested yet.
