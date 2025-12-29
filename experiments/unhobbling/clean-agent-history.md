---
model: gpt-oss:120b
branch: unhobbling-clean-agent-history
runtime: 30 minutes started at first token
puzzle: 03.json
---

# Data

| Run | Runtime (s) | Total Tokens | Correct Squares | Wrong Squares | Empty Squares | Wrong - Empty Squares |
| --- | ----------- | ------------ | --------------- | ------------- | ------------- | --------------------- |
| 1   | 1800        | 129397       | 10              | 177           | 172           | 5                     |
| 2   |             |              |                 |               |               |                       |
| 3   |             |              |                 |               |               |                       |

NOTE: I immediately gave up on this. It's abundantly clear from the thinking traces that the rumination on early
hints has not stopped. That indicates that this is _not_ a prompt poisoning problem. It's a training problem
with the LLM that prioritizes attempting to solve early hints. There's not even a noticeable token throughput increase
despite the smaller contexts.
