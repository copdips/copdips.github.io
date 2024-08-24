---
authors:
- copdips
categories:
- python
- sqlalchemy
comments: true
date:
  created: 2024-08-24
---

# Generating ERD from sqlalchemy

This posts tests some popular Python tools ([sqlalchemy_data_model_visualizer](https://github.com/Dicklesworthstone/sqlalchemy_data_model_visualizer/tree/main)
, [sqlalchemy_schemadisplay](https://github.com/fschulze/sqlalchemy_schemadisplay), and [eralchemy2](https://github.com/maurerle/eralchemy2)) to generate ERD ([Entity-Relation Diagram](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)) from sqlalchemy models.

The test code can be found in this Github [repo](https://github.com/copdips/fastapi-demo/tree/main/tools/sql_to_erd).

<!-- more -->

## Comparison

| Tool name                      | sqlalchemy_data_model_visualizer                                                                                                                                                 | sqlalchemy_schemadisplay                                                                                                                                    | eralchemy2                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| output format                  | ✅ svg                                                                                                                                                                           | ❌png                                                                                                                                                       | ✅pdf, png, svg, markdown mermaid |
| source format                  | sqlalchemy                                                                                                                                                                       | sqlalchemy + real DB                                                                                                                                        | ✅real DB                         |
| column type                    | ✅provided in new column                                                                                                                                                         | ❌missing (see output [png](https://github.com/copdips/fastapi-demo/blob/main/tools/sql_to_erd/sqlalchemy_schemadisplay_demo/sqlalchemy_schemadisplay.png)) | provided along with column name   |
| many to many association table | ❌missing link (see output [svg](https://github.com/copdips/fastapi-demo/blob/main/tools/sql_to_erd/sqlalchemy_data_model_visualizer_demo/sqlalchemy_data_model_visualizer.svg)) | provided                                                                                                                                                    | provided                          |
| usage                          | ❌should list all the sqlalchemy tables one by one                                                                                                                               | easy                                                                                                                                                        | easy                              |

- 😊 `sqlalchemy_data_model_visualizer` has a beautiful SVG output, but missing link for many-to-many association table.
- 😅 `sqlalchemy_schemadisplay` has a poor PNG output, and misses column type.
- 😍 `eralchemy2` the output is not as beautiful as `sqlalchemy_data_model_visualizer`, but the big advantage is that it can generate ERD from database only which is independent from sqlalchemy code, and it supports multiple output formats including [Mermaid](https://mermaid.live/) which can be easily rendered in Markdown.

There's no perfect tool, or I haven't found it yet...

!!! note "generating ERD from sql code"
    For a more general approach out of sqlalchemy, you can generate ERD from SQL code using [draw.io](https://www.drawio.com/blog/insert-sql).

!!! note "generating sql models from DB"
    You can generate sqlalchemy models from DB using [sqlacodegen](https://github.com/agronholm/sqlacodegen).
