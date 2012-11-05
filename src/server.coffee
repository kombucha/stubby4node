Admin = require('./portals/admin').Admin
Stubs = require('./portals/stubs').Stubs
Endpoints = require('./models/endpoints').Endpoints
CLI = require './console/cli'
out = require './console/out'
http = require 'http'
https = require 'https'

args = CLI.getArgs()

onListening = (portal, port, protocol = 'http') ->
   out.status "#{portal} portal running at #{protocol}://#{args.location}:#{port}"
onError = (err, port) ->
   msg = "#{err.message}. Exiting..."

   switch err.code
      when 'EACCES'
         msg = "Permission denied for use of port #{port}. Exiting..."
      when 'EADDRINUSE'
         msg = "Port #{port} is already in use! Exiting..."
      when 'EADDRNOTAVAIL'
         msg = "Host \"#{args.location}\" is not available! Exiting..."

   out.error msg
   process.exit()

onEndpointLoaded = (err, endpoint) -> out.notice "Loaded: #{endpoint.request.method} #{endpoint.request.url}"
endpoints = new Endpoints(args.data, onEndpointLoaded)

stubServer = (new Stubs(endpoints)).server
stubServer = http.createServer(stubServer)
stubServer.on 'listening', -> onListening 'Stubs', args.stubs, 'http'
stubServer.on 'error', (err) -> onError(err, args.stubs)
stubServer.listen args.stubs, args.location

httpsOptions = {}
if args.key and args.cert
   httpsOptions =
      key: args.key
      cert: args.cert
else if args.pfx
   httpsOptions =
      pfx: args.pfx

tlsServer = (new Stubs(endpoints)).server
tlsServer = https.createServer(httpsOptions, tlsServer)
tlsServer.on 'listening', -> onListening 'Stubs', args.tls, 'https'
tlsServer.on 'error', (err) -> onError(err, args.tls)
tlsServer.listen args.tls, args.location

adminServer = (new Admin(endpoints)).server
adminServer = http.createServer(adminServer)
adminServer.on 'listening', -> onListening 'Admin', args.admin
adminServer.on 'error', (err) -> onError(err, args.admin)
adminServer.listen args.admin, args.location

out.info '\nQuit: ctrl-c\n'
