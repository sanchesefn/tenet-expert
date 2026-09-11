#!/usr/bin/env python3
"""V2: never upload in-progress exams, relay-first, rating reads ntfy, paste-code recovery."""
from pathlib import Path


def extract_fn(src, start_token):
    i = src.find(start_token)
    if i < 0:
        return None, -1, -1
    b = src.find("{", i)
    depth = 0
    for j in range(b, len(src)):
        ch = src[j]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return src[i : j + 1], i, j + 1
    return None, i, -1


def replace_fn(src, start_token, new_fn):
    body, i, end = extract_fn(src, start_token)
    if body is None:
        raise SystemExit("not found: " + start_token)
    return src[:i] + new_fn + src[end:]
