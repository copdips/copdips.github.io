"""
https://medium.com/@themightyraider7/multiprocessing-with-sqlalchemy-in-python-65372888cfb8
"""
import multiprocessing
from pathlib import Path

from sqlalchemy import Engine, create_engine, text

# Create an engine with a connection pool in the parent process
engine: Engine = create_engine(f"sqlite:///{Path(__file__).parent}/sqlalchemy_multiprocess.db", pool_size=5)


def get_stuff():
    """
    The connection received here is the same
    as the one created in the parent process
    """
    with engine.connect() as conn:
        # And,tada! You might start seeing weird behaviours!
        print(conn.execute(text("select 1")).scalar_one_or_none())


# This will create a new connection
with engine.connect() as conn:
    # Post execution, the connection is returned to the pool.
    conn.execute(text("select 1"))

with multiprocessing.Pool(12) as pool:
    pool.apply(get_stuff)
