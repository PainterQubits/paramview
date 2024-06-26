# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0).

## [Unreleased]

## [0.5.0] (Jun 26 2024)

### Added

- Support for ParamDB v0.15.0.

### Changed

- Timestamp update functionality was modified to match ParamDB v0.15.0.

## [0.4.1] (Feb 7 2024)

### Added

- Support for ParamDB v0.11.0.

### Fixed

- Parameter list did not update upon exiting edit mode if latest was checked and a new
  commit had been made.

## [0.4.0] (Jan 4 2024)

### Added

- Command line option to not open a new browser window (used in internal testing).

## [0.3.0] (Dec 8 2023)

### Added

- Edit mode.
- Ability to commit directly from the UI.
- Commit comparison view of what has changed from the latest commit.

## [0.2.0] (May 4 2023)

### Added

- Automatically opening a browser window can be disabled when using the `start_server`
  Python function.

### Changed

- Improved automatic scrolling when searching for commits.
- Parameters are no longer sorted, meaning the original order is preserved.

## Fixed

- Dictionaries are no longer treated as lists in some cases.

## [0.1.1] (Apr 11 2023)

### Fixed

- Releases contain the frontend.

## [0.1.0] (Apr 11 2023)

### Added

- GUI for viewing contents of a ParamDB database.
- CLI command `paramview` for launching the GUI.
- `start_server` Python function to launch the GUI.

[unreleased]: https://github.com/PainterQubits/paramview/compare/v0.5.0...main
[0.5.0]: https://github.com/PainterQubits/paramview/releases/tag/v0.5.0
[0.4.1]: https://github.com/PainterQubits/paramview/releases/tag/v0.4.1
[0.4.0]: https://github.com/PainterQubits/paramview/releases/tag/v0.4.0
[0.3.0]: https://github.com/PainterQubits/paramview/releases/tag/v0.3.0
[0.2.0]: https://github.com/PainterQubits/paramview/releases/tag/v0.2.0
[0.1.1]: https://github.com/PainterQubits/paramview/releases/tag/v0.1.1
[0.1.0]: https://github.com/PainterQubits/paramview/releases/tag/v0.1.0
