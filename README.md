# ParamView

GUI for viewing the contents of a ParamDB database.

## Installation

Install the latest version of ParamView using pip:

```
pip install -U paramview \
    --extra-index-url https://painterqubits.github.io/paramview/releases \
    --extra-index-url https://painterqubits.github.io/paramdb/releases
```

The `extra-index-url` parameters are needed since ParamView and ParamDB are not published
to PyPI yet. If you are using a Python package manager, add
`https://painterqubits.github.io/paramview/releases` and
`https://painterqubits.github.io/paramdb/releases` as secondary sources before installing.
For example, for [Poetry] the commands are:

```
poetry source add --secondary paramview https://painterqubits.github.io/paramview/releases
poetry source add --secondary paramdb https://painterqubits.github.io/paramdb/releases
```

Then ParamView and ParamDB can be added like any other package.

## Usage

To launch the ParamView GUI, run:

```
paramview <path to ParamDB database file>
```

For more options, run `paramview --help`.

[poetry]: https://python-poetry.org
