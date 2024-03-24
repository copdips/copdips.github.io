---
authors:
- copdips
categories:
- python
- sqlalchemy
- flask
- quart
comments: true
date:
  created: 2024-03-24
---

# First try on Quart an asyncio re-implementation of Flask

Flask is a little bit old-fashioned today (I know it's still widely used), as it's [not async native](https://flask.palletsprojects.com/en/3.0.x/async-await/#when-to-use-quart-instead), among others. When I prepared my [fastapi-demo](https://github.com/copdips/fastapi-demo) this weekend, I discovered a new framework called [Quart](https://github.com/pallets/quart), which is maintained by Pallet Project, the same community maintaining Flask. They said ["Quart is an asyncio re-implementation of the popular Flask micro framework API. This means that if you understand Flask you understand Quart."](https://github.com/pallets/quart#relationship-with-flask). So I decided to give it a try.

<!-- more -->

## Demo

To test, I just searched `flask sqlalchemy sample` on Google, and got this sample repo: [app-generator/sample-flask-sqlalchemy](https://github.com/app-generator/sample-flask-sqlalchemy). It's a Web UI based on Flask. I cloned it, and tried to convert it to Quart.

Firstly, install the project, and run the Flask app, everything is fine.

Now, let's convert it to Quart. There's already a [Flask to Quart migration guide](https://quart.palletsprojects.com/en/latest/how_to_guides/flask_migration.html) on the official site. Basically, it's just replacing `flask` with `quart` in the import statements, and adding async/await to the view and testing functions.

In addition to what the guide says, I also need to:

1. add `await` to the `render_template()`.
2. use new sqlalchemy db models syntax, with `from sqlalchemy.orm import Mapped, mapped_column`, this is not related to Quart, but I installed the newest version of sqlalchemy, and the old syntax is deprecated.
3. install the extension [quart-flask-quart](https://github.com/pgjones/quart-flask-patch/), and import it in the file where `app` is created, and replace `app` with `QuartFlaskQuart(__name__)`. This extension patches the Quart app to be compatible with many popular [Flask extensions](https://github.com/pgjones/quart-flask-patch/#extensions-known-to-work), so that `flask-sqlalchemy`, `flask-login`, `flask-caching`, `flask-limiter`, etc. can be used in Quart.

After these small changes, the Quart app runs successfully, and the Web UI is still working. Although my test is very light, this is really a very good starting point for me. Wonderful!

Furthermore, I also tried [Quart-Schema](https://github.com/pgjones/quart-schema), a Quart extension that provides schema validation and auto-generated API documentation, similar to FastAPI. After testing, it works well, leveraging [msgspec](https://jcristharif.com/msgspec/) and [Pydantic](https://docs.pydantic.dev/) behind the scenes, which is really impressive!

My conclusion is, if you are using Flask, and want to try the async, Quart might be a good choice. It's easy to migrate from Flask, and many of the Flask extensions are still usable.
