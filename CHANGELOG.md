# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.2](https://github.com/7596ff/obsidian-pandoc-advanced/compare/0.0.1...0.0.2) (2023-05-29)

### 0.0.2 (2023-05-20)

- instead of writing an `index.yaml` file, specify the intended
  `data-dir` and `resource-path` options in the command
- fix defaults files not being in the correct place for pandoc to find
  them
- workaround an issue with pandoc not inheriting `data-dir` in defaults
  file inheritance by manually inserting the intended `data-dir` into
  each configuration file

### 0.0.1 (2023-05-09)
