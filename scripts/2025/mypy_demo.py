# https://mypy.readthedocs.io/en/stable/generics.html#type-variables-with-value-restriction
def concat[S: (str, bytes)](x: S, y: S) -> S:
    return x + y

concat('a', 'b')    # Okay
concat(b'a', b'b')  # Okay
concat(1, 2)        # Error!
