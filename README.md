# ParamView

GUI for viewing the contents of a ParamDB database.

## Installation

Install the latest version of ParamView using pip:

```
pip install -U paramview --extra-index-url https://painterqubits.github.io/paramview/releases
```

The `extra-index-url` parameter is needed since ParamView is not published to PyPI yet. If
you are using a Python package manager, add
`https://painterqubits.github.io/paramview/releases` as a secondary source. For example,
for [Poetry] the command is

```
poetry source add --secondary paramview https://painterqubits.github.io/paramview/releases
```

## Usage

To launch the ParamView GUI, run:

```
paramview <path to ParamDB database file>
```

For more options, run `paramview --help`.
