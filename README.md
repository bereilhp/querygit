# querygit

Ask questions about your git repository using natural language.

## Install

```bash
npm install -g querygit
```

## Setup

```bash
export CEREBRAS_API_KEY=your_api_key
```

>Note: The model is hardcoded to `llama3.1-8b` via Cerebras API.

## Usage

```bash
querygit "show me the last commit message"
```

## Output

```
Model
-------
llama3.1-8b (Cerebras)

Command
-------
git log -1 --format=%s

Result
-------
Release v1.0.2
```