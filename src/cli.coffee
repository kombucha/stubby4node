fs = require 'fs'
exports.CLI = CLI =
   help: (argv, quit = false) ->
      argv ?= process.argv

      if '--help' in argv or '-h' in argv
         console.log """
            stubby [-s <port>] [-a <port>] [-f <file>] [-h]\n
            -s, --stub [PORT]                    Port that stub portal should run on. Defaults to 8882
            -a, --admin [PORT]                   Port that admin portal should run on. Defaults to 8889
            -f, --file [FILE.{json|yml|yaml}]    Data file to pre-load endoints.
            -h, --help                           This help text.
            -v, --version                        Prints stubby's version number.
         """
         process.exit 0 if quit

   version: (argv, quit = false) ->
      if '--version' in argv or '-v' in argv
         data = JSON.parse fs.readFileSync 'package.json', 'utf8'
         console.log data.version
         process.exit 0 if quit

   getAdmin: (argv) ->
      argv ?= process.argv
      admin = 8889

      adminOptionIndex = argv.indexOf('--admin') + 1 or argv.indexOf('-a') + 1
      admin = parseInt(argv[adminOptionIndex]) ? admin if adminOptionIndex

      return admin

   getStub: (argv) ->
      argv ?= process.argv
      stub = 8882

      stubOptionIndex = argv.indexOf('--stub') + 1 or argv.indexOf('-s') + 1
      stub = parseInt(argv[stubOptionIndex]) ? stub if stubOptionIndex

      return stub

   getFile: (argv) ->
      argv ?= process.argv
      file = []

      fileOptionIndex = argv.indexOf('--file') + 1 or argv.indexOf('-f') + 1
      if fileOptionIndex
         filename = argv[fileOptionIndex]
         filedata = fs.readFileSync filename, 'utf8'
         extension = filename.replace /^.*\.([a-zA-Z0-9]+)$/, '$1'
         if filedata
            switch extension
               when 'json'
                  try
                     file = JSON.parse filedata
                  catch e
                     console.error "Couldn't load #{filename} due to syntax errors:"
                     console.dir e
                     file = []
               when 'yaml','yml'
                  yaml = require 'js-yaml'
                  file = yaml.load filedata

      return file

   getArgs: (argv) ->
      argv ?= process.argv
      @help argv, true
      @version argv, true

      args =
         file: @getFile argv
         stub: @getStub argv
         admin: @getAdmin argv

   red: '\u001b[31m'
   green: '\u001b[32m'
   yellow: '\u001b[33m'
   blue: '\u001b[34m'
   purple: '\u001b[35m'
   reset: '\u001b[0m'

   info: (msg) ->
      console.log "#{@blue}#{msg}#{@reset}"
   success: (msg) ->
      console.log "#{@green}#{msg}#{@reset}"
   error: (msg) ->
      console.error "#{@red}#{msg}#{@reset}"
   warn: (msg) ->
      console.warn "#{@yellow}#{msg}#{@reset}"
   notice: (msg) ->
      console.log "#{@purple}#{msg}#{@reset}"
