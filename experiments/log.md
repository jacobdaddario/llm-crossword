# Problems:

- [x] I need a array of state for chat rendering. I cannot separate state because I need the agent trace for rendering, and I would lose order if I put them in separate buckets. Therefore, every agent line must be in the same state.
  - [x] I need to update the state of last messages while keeping the state updater a pure function to keep React happy (and correctly notifying the need for a re-render, since that's why state changes have to be pure functions)
    - [x] I need code to strip out the last item, and then append a new version of that last item into a new array with copies of the previous items.
    - [x] I need code to update an agent transaction with new message content as it appears.
    - [x] Mutate the state using the provided functions
  - [x] I need to add code to account for when a new transaction begins, creating a new transaction in the agent trace.

- [x] I need an agent loop
  - [x] I need a looping mechanism
  - [x] I need a ChatHistory (Array of Message instances) to perpetuate the loop
  - [x] I need to establish tool usage
    - [x] I need to define my tools and their execution logic
    - [x] I need to connect those tools to React
      - [x] Construct state around active clue
    - [x] I need to add tool invocations into the message history / rendering.
      - [x] Connect the tools to the chat request and render / record their invocations.
      - [x] Evaluate the tool invocations and push those to history as well.
  - [x] I need the ability to stop the loop from running.
  - [x] I need the ability to start the agent loop.
- [x] Clear the correctness matrix when the agent next writes to the puzzle
- [x] Fix the state that breaks on the start-stop button, showing the wrong icon
- [x] Add an empty state to the model output prior to beginning
- [x] Rescue malformed stream parsing on tools
- [x] Figure out how to make ~the effect~ eslint realize the output of my custom hook is a ref and function that shouldn't trigger re-renders
- [x] Identify if the remaining 500's are due to bad tool calls, and see what I can do to stop spirals
      https://github.com/ollama/ollama/issues/11800?utm_source=chatgpt.com
      Very hard to determine why we're getting 500's. What's clear is that Ollama does this for various
      reasons, including malformed tool calls, and if the client gets a 500 on a streaming response, it will always boom without a response
      body that we can control. Best thing to do is to catch and retry, like I am already.
- [x] Do one last audit of the baseline agent before doing enhancements.
- [x] Discovered some horrifically bad code that happened to work by sheer luck with the clue filling logic. I wrote a _lot_ of terrible code while exhausted. I'm updating the board by mutating a ref that happens to be stable. It should have not updated the UI, but it worked because other state changes happened. I need to correct that to be in the correct state setting paradigm. It's a miracle that it works at all.
- [x] Improve the output of the `check_puzzle` tool so that the agent can tell what it got right and wrong.
- [x] Start stripping trace history for when sessions get long. React got very slow once the trace state got huge. Rendering slowed down massively.
- [x] Fix bug where overfilling a clue doesn't trigger an error.
- [x] Factor the custom hook code into new files to reduce the mental overhead (have had a hard time finding the proper format for factoring, so I'm putting them into their own file.
- [x] ~End the loop if the puzzle is solved~ Skipping this because it is prohibitively difficult for some stupid reason. I have no idea why, but the loop keeps terminating although that seems incorrect.
- [x] Extract setTrace into a reducer to consolidate list of state changes.
- [x] Add tool outputs to the trace

# Experiment Concepts

- [ ] Measure various agent adjustments for improvements in efficacy. (Tried with 20b since that's what I'm going to try to fine-tune, but it's too stupid as a baseline. I want to try to get to actual gains in long horizon tasks like solving clues from crosses. Doing 120b instead).
  - [x] Control measure
  - [x] Provide sample traces
        Hypothesis: Few-shot steering will improve chains of thought - Wrong, had no effect and dramatically slowed inference.
  - [x] Remove the tool that shows puzzle state and always include puzzle state in the prompt
        Hypothesis: Cycles are wasted on finding puzzle state via tools. Reducing tools available and always giving state will increase output and correctness. - Maybe, but it seems more hamstrung by the fact that it ruminates endlessly on the same clues. Looks like it's blocked by its inability to go down the clue list for now.
  - [x] Cycle order of clues in cluelist
        Hypothesis: The LLM ruminates on early clues repeatedly, even when it has correct answers, due to a predisposition to prefer the top of the clue list. - Maybe. Definitely saw far more squares filled. I don't track this currently, so I need to add it to the list of stuff that I track. I want to do 3 more runs with this and the control to get metrics on squares filled. Additionally, it still ruminates on early clues a fair bit. I think that's due to prompt poisoning. I could benefit from skipping the reduced tool call experiments, instead jumping straight to no history in cycle, which would have fewer tool calls implicitly. Also, it would be good to monitor rumination on different topics by keeping a log of every run, which I could segment.
        _Action Items:_
    - [x] Re-run experiments for control and clue shuffle to get the diff on filled squares
    - [x] Begin recording full run-logs to analyze for agent behaviors
    - [x] Write a conversation segmentation script to determine frequency of agent behaviors
          Done, but it was useless. I need to come up with a different way to analyze agent transcripts.
          I literally think I just need a SAE to do this. I might just be trying to replicate that behavior in a terribly inefficient way.
    - [ ] Tee-up the no-history experiment next to test for prompt poisoning affecting clue selection
  - [ ] No history in cycle. Always start fresh with puzzle state and clue list
  - [ ] Randomize order of clues
  - [ ] Remove the tool that shows hint list and always include it in the prompt
        Only do this if the history-less approach proves to not unblock the current iteration
  - [ ] Automatically check the puzzle correctness every run
- [ ] Compare and measure gpt-oss:20b, gpt-oss:120b, and other similarly sized models like llama3.1:70b. Compare both bare-bones agent and the enhanced agent form the above experiment.
- [ ] Attempt to fine-tune gpt-oss:20b to improve agent efficacy.
- [ ] Test Raw GPT-5.1 to see efficacy against local inference models. This will be a pain due to the overfitting of the current solution to ollama.
  - [ ] Run on recent puzzles that won't be in its training data (unquantized, it will probably find old puzzles in its latent space).
  - [ ] Compare hard and easy puzzles for old (certainly in data) and new (truer test of capabilities).
- [ ] Due interpretability experiments on histories from these agent runs to identify features related to task.
  - [ ] If I successfully finetune the gpt-oss:20b model, it would be interesting to do another SAE on that as well.
