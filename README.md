# **JG Client**

Command Line Utilities that are probably only useful to me 

## Installation

* Clone the repo
* `yarn install`
* In your shell configuration, create a reference to the directory of this project and an alias to the `cli` command:
  * `export CLI_DIR="~/projects/jg-cli"`
  * `alias cli=$CLI_DIR/cli`

## Usage

```
$ cli help

$ cli command

Commands:
  cli todoist <file>
```

### About Todoist

For a long time, I was using Todoist, a todo-list task tracking app to keep track of everything including recipes, 
lists, and random thoughts. But Todoist isn't great for doing non-todo related things, so I wanted to move many of my
Todoist projects over to Apple Notes with each Todoist task mapping to an individual Note. Contrary to what you might
believe, this wasn't easy.

#### Migrating tasks from Todoist to Apple Notes

1. Go to a Todoist project and choose `Export as Template` and then choose `CSV` as the format
2. Run `cli todoist <location_of_exported_csv_file` from the command line (after setting up this cli tool). A directory will be created at `$CLI_DIR/output/"
3. In Apple Notes, run `File -> Import to Notes` and choose the folder that was just created from the running the cli tool. You should see everything imported into Apple Notes under a folder called "Imported Notes"
