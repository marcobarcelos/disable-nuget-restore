# disable-nuget-restore

> Disable NuGet Package Restore CLI.

A command line tool which disables NuGet Package Restore in a solution,
by removing the .nuget directory and removing NuGet references in project files (.csproj).


## Install

```
$ npm install -g disable-nuget-restore
```

## Usage

Run the command line utility in the solution directory:

```
$ disable-nuget-restore
```

or specify solution path:

```
$ disable-nuget-restore <path>
```

## Examples

```
$ cd Solution
$ disable-nuget-restore

$ disable-nuget-restore C:\Users\marco.barcelos\Solution\

$ disable-nuget-restore ../Solution/
```

## License

MIT © [Marco Barcelos](http://marcobarcelos.com)
