# Fastify Guide
1. [What is Fastify](#what-is-fastify)
2. [The Plugin System and the Boot Process](#the-plugin-system-and-the-boot-process)
3. [Working with Routes](#working-with-routes)
4. [Working with Prisma for DB](#working-with-prisma-for-db)
5. [Using GoogleOAuth](#using-googleoauth)
6. [Using JWT tokens](#using-jwt-tokens)

## What is Fastify
1. [Fastify Components](#fastifys-components)
2. [Starting the Server](#starting-the-server)
3. [Lifecycle and Hooks overview](#lifecycle-and-hooks-overview)
4. [The Root Application Instance](#the-root-application-instance)
5. [Adding Basic Routes](#adding-basic-routes)
6. [The Reply Component](#the-reply-component)
7. [The first POST route](#the-first-post-route)
8. [The Request Component](#the-request-component)
9. [Parametric Routes](#parametric-routes)
10. [Adding a Basic Plugin Instance](#adding-a-basic-plugin-instance)

It's a Nodejs web framework used to build server applications, focused on:
- Promoting a **plugin design system**
- Fast performance (claiming to be the **fastest**)

### Fastify's Components
It adds a layer of abstraction onto the Node.js std modules. It has two type of components:
- **main components** such as:
    - **root application instance**: manages the srd Node.js ```http.Server``` class
    - **plugin instance(s)**: a child obj of the app instance that isolates itself from the other sibiling plugins
    - **Request** and **Reply** obj: wrappers of Node.js ```http.IncomingMessage``` and ```http.ServerResponse```

- **utility components**:
    - **hook**: fns that act during the lifecycle of the application or a single req\res
    - **decorators**: let you argument the features installed by default on the main components (avoiding code duplication)
    - **parsers**
### Starting the Server
***You need to set up the dev env, which i will do using TS instead of JS.***
1. Install node (via a node version manager like volta)
2. ```npm init -y``` to create the project
3. ```npm i fastify [fastify-swagger]``` prod modules
4. ```npm i -D nodemon typescript @types/node pino-pretty``` dev module for hot reload
5. Initialize a TypeScript configuration file:
```npx tsc --init```
6. [opt] Set the ```scripts``` section of the ```package.json```
7. [opt] change type to module in package.json
8. Change ```tsconfig.json``` to set the entry point script and according to your needs/preferences

**Note: Set target property in tsconfig.json to es2017 or greater to avoid FastifyDeprecation warning.**

Now we are ready to start an HTTP server with fastify, creating a file_name.ts (in this guide wille be server.ts) and writing in it the base server logic
```ts
import fastify from 'fastify' // import fastify factory method for base server

const PORT = 5000

const server = fastify({ // passing server opts
    logger: true
})

// i could have done
// const serverOptions = {
//     logger: true
// }
// const server = fastify(serverOptions)

const start = () => {
        // default IPv4 address is 0.0.0.0 if not specified
        server.listen({
                port: PORT,
                host: '0.0.0.0'
            }, (err, address) => { // listen returns an error type and an address, if you want to intercept them
            if (err) { server.log.error(err), process.exit(-1) };
            console.log(`Server listening at ${address}`)
        }
    )
}

server.get('/ping', async (request, reply) => { // adding a route (route, callback)
    // reply.send({test: "hello"})
    return {test: 'pong\n'} // these two are the same
})

start()
```

Now we can launch the server (in dev for now)
```bash
tsc -p tsconfig.json
nodemon server.js
```
Now we can try accessing the http://localhost:5000/ping to get a single ```pong``` onto the screen.

### Lifecycle and Hooks overview
Fastify implements two systems that regulate its internal workflow triggering a large set of events during the application's lifetime:
- **application lifecycle** tracks the status of the application instance and triggers this set of events (all of these are **hooks**, specifically **application hooks**):
    - **onRoute** event acts when you add an endpoint to the server instance
    - **onRegister** event is unique as it performs when a new encapsulated context is created
    - **onReady** event runs when the application is ready to start listening for incoming HTTP requests
    - **onClose** event executes when the server is stopping
        ```ts
        server.addHook ( 'onRoute' , function inspector ( routeOptions ) {
            console.log ( routeOptions )
        } )
        server.addHook ( 'onRegister' , function inspector ( plugin ,
        pluginOptions ) {
            console.log ( ' Chapter 2 , Plugin System and Boot Process ' )
        } )
        server.addHook ( 'onReady' , function preLoading (done) {
            console.log ( ' onReady ' )
            done ( )
        })
        server.addHook ( 'onClose' , function manageClose () {
            console.log ( ' onClose ' )
        } )

        // or
        // server.addHook ( 'onReady' , async function preLoading () {
        // console.log ( ' onReady ' )
        // })
        // server.addHook ( 'onClose' , async function manageClose () {
        //     console.log ( ' onClose ' )
        // } )
        ```
    There are two primary API interfaces for these hooks:
    - **obj arg**: these types can only manipulate the input object adding side effects. Aside effect changes the object's properties value, causing new behavior of the object itself.
    - **callback arg**: The done input function can impact the application's startup because the server will wait for its completion until you call it . In this timeframe, it is possible to load some external data and store it in a local cache. If you call the callback with an error object as the first parameter, done ( new Error ( ) ) , the application will listen, and the error will bubble up, crashing the server startup. (ofc you can omit the done by setting the callback fn as async)
    So, it's crucial to load relevant data and manage errors to prevent them from blocking the server.
    **If you don't need to run async code execution such as I/ O to the filesystem or to an external resource
    such as a database, you may prefer the callback style. It provides a simple function done within the
    arguments, and is slightly more performant than an async function!**
    ![application hooks](img/application%20hooks.png)

- **request lifecycle** has a lot more events (that will be explained in detail in an another chapter) and are managed by a class of hooks called **request and reply hooks**. This lifecycle defines the flow of every HTTP request that your server will receive. The server will process the request in two phases:
    - **The routing**: This step must find the function that must evaluate the request
    - **The handling** of the request performs a set of events that compose the request lifecycle
### The Root Application Instance
#### Serve Options
Whenyou create a Fastify server, you have to choose some key aspects before starting the HTTP server (<a href='https://www.fastify.io/docs/latest/Reference/Server/'>full doc</a>):
- **logger**: to customize the logger
- **https**: to set up the https server
- **keepAliveTimeout, connectionTimeout, http2SessionTimeout**: timeout parameters after which the HTTP request socket will be destroyed
- **maxParamLength: number<length>** limits the path parameter string length.
- **bodyLimit: number<byte>** caps the request body payload size.
- **http2**: boolean to start an HTTP2 server
- **ajv**: tweaks the validation defaults
- **serverFactory**: (function) manages the low-level HTTP server that is created
- **onProtoPoisoning, onConstructorPoisoning**:  default security settings are
    the most conservative and provide you with an application that's secure by default. Changing them is risky and you should consider all the security issues because it impacts the default request body parser and can lead to code injection.
All of them are set to default values, if not specified otherwise.
#### Application Instance Methods
We have already seen the app.addHook(eventName, hookHandler) method,
which appends a new function that runs whenever the request lifecycle or the application lifecycle
triggers the registered event.
The methods at your disposal to create your application are:
- **app.route(options[, handler])** adds a new endpoint to the server.
- **app.register(plugin)** adds plugins to the server instance, creating a new server context
if needed. This method provides Fastify with encapsulation, which will be covered in Chapter 2.
- **app.ready([callback])** loads all the applications without listening for the HTTP request.
- **app.listen(port|options [,host, callback])** starts the server and loads
the application.
- **app.close([callback])** turns off the server and starts the closing flow. This generates
the possibility to close all the pending connections to a database or to complete running tasks.
- **app.inject(options[, callback])** loads the server until it reaches the ready status
and submits a mock HTTP request. You will learn about this method in Chapter 9.
This API family will return a native Promise if you don’t provide a callback parameter. This code
pattern works for every feature that Fastify provides: whenever there is a callback argument, you can
omit it and get back a promise instead!
### Adding Basic Routes
The routes are the entry to our business logic. The HTTP server exists only to manage and expose routes to clients. A route is commonly identified by the HTTP method and the URL. This tuple matches your function handler implementation. When a client hits the route with an HTTP request, the function handler is executed.

Before the ```listen``` call, we can write the following:
```ts
server.route({
    url: '/hello',
    method: 'GET',
    handler: function myHandler(req, rep) {
        rep.send('world')
    }
})
// OR using the shorthand declaration
// app.<HTTP method>(url[, routeOptions], handler)
server.get(url, handlerFn)
server.get(url, {
    handler: handlerFn,
    // other opts
})
server.get(url, [opts], handlerFn)
```
All the HTTP methods, including **GET**, **POST**, **PUT**, **HEAD**, **DELETE**, **OPTIONS**, and **PATCH**, support the shorthand declaration.
**It's important to notice that handler fn can be anonymous fns BUT using named fns allow the access to the this object and anonymous fns don't**
```ts
server.get('/path', () => return this.server.address()) // WRONG!!! 
server.get('/path', function serverAddr() {return this.server.address}) // CORRECT 
```
### The Reply Component
It provides a full set of functions to control all response aspects:
- **reply.send(payload)** will send the response payload to the client. The payload can be
a String, a JSON object, a Buffer, a Stream, or an Error object. It can be replaced by returning
the response’s body in the handler’s function.
- **reply.code(number)** will set the response status code.
- **reply.header(key, value)** will add a response header.
- **reply.type(string)** is a shorthand to define the Content-Type header.

The Reply component’s methods can be chained to a single statement to reduce the code noise as
follows: ```reply.code(201).send('done')```.

Another utility of the **Reply** component is the headers’ auto-sense. Content-Length is equal to the length of the output payload unless you set it manually. Content-Type resolves strings to text/plain, a JSON object to application/json, and a stream or a buffer to the application/octet-stream value. Furthermore, the HTTP return status is 200 Successful when the request is
completed, whereas when an error is thrown, 500 Internal Server Error will be set.
If you send a Class object, Fastify will try to call ```payload.toJSON()``` to create an output payload:

```ts
class Car {
    constructor(model) {
        this.model = model
    }
    toJSON() {
        return {
        type: 'car',
        model: this.model
        }
    }
    }

app.get('/car', function (request, reply) {
    return new Car('Ferrari')
})
```

### The first POST route
```ts
const cats = []
app.post('/cat', function saveCat(request, reply) {
    cats.push(request.body)
    reply.code(201).send({ allCats: cats })
})
```
### The Request Component
During the implementation of the POST route, we read the '''request.body''' property. The body is one of the most used keys to access the HTTP request data. You have access to the other piece of the
request through the API:
- **request.query** returns a key-value JavaScript object with all the query-string input parameters.
- **request.params** maps the URL path parameters to a JavaScript object.
- **request.headers** maps the request’s headers to a JavaScript object as well.
- **request.body** returns the request’s body payload. It will be a JavaScript object if the request’s Content-Type header is application/json. If its value is text/plain, the body value will be a string. In other cases, you will need to create a parser to read the request payload accordingly.

The Request component **is capable of reading information about the client and the routing process** too:
```ts
server.get('/xray', function xRay(request, reply) {
    // send back all the request properties
    return {
        id: request.id, // id assigned to the request in req-<progression number>
        ip: request.ip, // the client ip address
        ips: request.ips, // proxy ip addressed
        hostname: request.hostname, // the client hostname
        protocol: request.protocol, // the request protocol
        method: request.method, // the request HTTP method
        url: request.url, // the request URL
        routerPath: request.routerPath, // the generic handler         URL
        is404: request.is404 // the request has been routed or not
    }
})
```

### Parametric Routes
To set a path parameter, we must write a special URL syntax, using the colon before our parameter’s name. Let’s add a GET endpoint beside our previous POST /cat route:
```ts
app.get('/cat/:catName', function readCat(request, reply) {
    const lookingFor = request.params.catName
    const result = cats.find(cat => cat.name == lookingFor)
    if (result) {
        return { cat: result }
    } else {
        reply.code(404)
        throw new Error(`cat ${lookingFor} not found`)
    }
})
```
This syntax **supports regular expressions too**. For example, if you want to modify the route previously created to exclusively accept a numeric parameter, you have to write the RegExp string at the end of the parameter’s name between parentheses:
```ts
app.get('/cat/:catIndex(\\d+)', function readCat(request, reply) {
    const lookingFor = request.params.catIndex
    const result = cats[lookingFor]
    // …
})
```
Although it comes at a performance cost.
It supports the wildcard syntax too
```ts
app.get('/cat/*', function readCat(request, reply) {
    reply.send({allCats: cats})
    // …
})
```
Note that this endpoint will not conflict with the previous because they are not overlapping, thanks to the match order:
1. **Perfect match**: /cat
2. **Path parameter match**: /cat/:catIndex
3. **Wildcards**: /cat/*
4. **Path parameter with a regular expression**: /cat/:catIndex(\\d+)

### Adding a Basic Plugin Instance
It's a child component of an application instance and to create one you just have to register it:
```ts
app.register(function myPlugin(pluginInstance, opts, next) {
    // do stuff
    next()
}, {hello: 'the opts obj'})

// or
const myPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.get('/', async (req, res) => {
        return users;
    })
    // various routes
}
app.register(myPlugin)

```
You can also set a base route for the plugin to work, passing the **prefix** opt to register
```ts
server.register(myPlugin, { prefix: 'myPluginRoot/'})
```
These simple lines have just created an **encapsulated context**: this means that every event, hook, plugin, and decorator registered in the myPlugin function scope will remain inside that context and
all its children. Optionally, you can provide an input object as a second parameter to the register function. This will propagate the input to the plugin’s opts parameter. If you move the plugin to another file, this will become extremely useful when sharing a configuration through files.

## The Plugin System and the Boot Process
Thanks to their unique properties, plugins are the basic building blocks of our application. Some of
the most prominent properties are the following:
- A plugin can register other plugins inside it.
- Aplugin creates, by default, a new scope that inherits from the parent. This behavior also applies
to its children and so on, although using the parent’s context is still possible.
- Aplugin can receive an options parameter that can be used to control its behavior, construction,
and reusability.
- A plugin can define scoped and prefixed routes, making it the perfect router.
1. [Plugin Fn Signatures](#plugin-fn-signatures)
2. [Exploring the Options Parameter](#exploring-the-options-parameter)
### Plugin Fn Signatures
```ts
app.register(function myPlugin(fastify, [opts], done){ ... done()})
// or
app.register(async function myPlugin(fastify, [opts]){ ... })
```
### Exploring the Options Parameter
This can be passed in the register fn to extend the plugin context.
```ts
async function myPlugin(fastify, options)
app.register(myPlugin, { first: 'option'})
```
Now, inside the myPlugin fn, i can access this value simply using ```options.first```.
It's worth mentioning that Fastify reserve three specific options that have a special meaning:
- **prefix**
- **logLevel**
- **logSerializers**

Considering that in the future more reserved words might be added it would be smart using a namespace to avoid future collisions (even if it's not mandatory).
For example
```ts
app.register(myPlugin, { 
    prefix: 'v1',
    myPlugin: {
        first: 'custom option'
    }
})
```

## Working with Routes
In this section we will focus on how to become more proficient at managing routes and keeping track of all our endpoints, covering all the possibilities thatFastify offers to define new endpoints and manage the application without giving yourself an headache.
1. [Declaring API endpoints and managing the errors](#declaring-api-endpoints-and-managing-the-errors)
2. [Routing to the Endpoint](#routing-to-the-endpoint)
3. [Router application tuning](#router-application-tuning)
4. [Reading the client's input](#reading-the-clients-input)
5. [Managing the route's scope](#managing-the-routes-scope)
6. [Adding New Behaviors to Routes](#adding-new-behaviors-to-routes)

### Declaring API endpoints and managing the errors
Fastify lets you use the software architecture you like most. In fact, this framework doesn’t limit you
from adopting **Representation State Transfer (REST)**, **GraphQL**, or simple **Application Programming Interfaces (APIs)**. The first two architectures standardize the following:
- **The application endpoints**: The standard shows you how to expose your business logic by defining a set of routes
- **The server communication**: This provides insights into how you should define the input/output
In this chapter, we will create **simple API endpoints with JSON input/output interfaces**. This means that we have the freedom to define an internal standard for our application; this choice will let us
focus on using the Fastify framework instead of following the standard architecture.
In any case, in Chapter 7, we will learn how to build a REST pplication, and in Chapter 14, we will find out more about using GraphQL with Fastify.
#### Declaration Variants and Route Options
As we've seen before in [Adding Basic Routes](#adding-basic-routes) we have two sintaxes available to define **routes**:
- **generic**
    ```ts
    app.route(routeOptions)
    ```
- **shorthand**
    ```ts
    app.<HTTP method>(url[, routeOptions], handler)
    ```
The options available are listed as follows:
- **method**: the HTTP method to expose
- **url**: the endpoint that listens for incoming requests
- **handler**
- **logLevel**
- **logSerializer**
- **bodyLimit**: This limits the request payload to avoid possible misuse of your endpoints. It must be an integer that represents the maximum number of bytes accepted, overwriting the root instance settings.
- **constraints**: This option improves the routing of the endpoint. We will learn more about how to use this option in the Routing to the endpoint section.
- **errorHandler**: This property accepts a special handler function to customize how to manage errors for a single route. The following section will show you this configuration.
- **config**: This property lets you specialize the endpoint by adding new behaviors.
- **prefixTrailingSlash**: This option manages some special usages during the route registration with plugins. We will talk about that in the Routing to the endpoint section.
- **exposeHeadRoute**: This Boolean adds or removes a HEAD route whenever you register a GET one. By default, it is true.
- **other opts to manage req validation**

#### Bulk Routes Loading
The generic declaration lets you take advantage of the route automation definition. This technique aims
to divide the source code into small pieces, making them more manageable while the application grows.
Let’s start by understanding the power of this feature:
```ts
const routes = [
    {
        method: 'POST', url: '/cat',
        handler: function cat (request, reply) {
            reply.send('cat') }
    },
    {
        method: 'GET', url: '/dog',
        handler: function dog (request, reply) {
            reply.send('dog') }
    }
]
routes.forEach((routeOptions)
    app.route(routeOptions)
)
```
### Routing to the Endpoint
#### The 404 Handler
Fastify provides a way to configure a 404 handler, like a typical route handler
```ts
app.setNotFoundHandler(function custom404(req, res) {...})
```
As usual, this feature is also encapsulated, so you could set one Not Found handler for each context:
```ts
app.register ( async function plugin ( instance , opts ) {
    instance.setNotFoundHandler ( function html404 ( request ,
    reply) {
        reply.type ( ' application/ html ' ) . send ( niceHtmlPage )
    })
} , { prefix : ' / site ' } )

app.setNotFoundHandler ( function custom404 ( request , reply )
{
    reply.send ( { not : ' found ' } )
} )
```

### Router application tuning
#### Trailing Slash
Fastify thinks that ```/foo``` and ```/foo/``` URLs are different, so you can register them and let them reply two completely different outputs.
Since this interface can be misanderstood, it's better to treat these URLs as the same entity and we do that by saying to the Fastify router to ignore the trailing slash in the opts
```ts
const app = fastify({
    ignoreTrailingSlash: true
})
```
#### Case-Insensitive URLs
Same issue here: Fastify thinks that ```/Foo``` and ```/foo/``` URLs are different and, to avoid misunderstanding, we can set an opt to set the case sensitivity
```ts
const app = fastify({
    caseSensitive: false
})
```
#### Rewrite URL
This feature adds the possibility of changing the HTTP's requested URL before the routing takes place:
```ts
// the raw request is of type HTTP.IncomingMessage of node, not FastifyRequest!!!!
import type { IncomingMessage } from 'http'
// ...
const app = fastify({
    rewriteUrl: (rawRequest: IncomingMessage) => {
        const url = rawRequest.url || '/' // url can be undefined
        if (url.startsWith('/api')) {
            return url
        }
        return `/public${url}`
    }
})
```
This is really useful in a SPA since i can let all the API calls pass and direct all the remaining requests to the /public, using @fastify/static to serve the SPA files (although is maybe better to work in a simpler less 'magic' direction)
```ts
server.register(api, { prefix: 'api'})
server.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
})
// route catch-all per la SPA
server.setNotFoundHandler((request, reply) => {
  const url = request.raw.url || ''

  if (url.startsWith('/api')) {
    // vere 404 per le API
    reply.code(404).send({ error: 'Not found' })
  } else {
    // qualunque altra cosa → index.html della SPA
    return reply.sendFile('index.html')
  }
})
```
### Reading the client's input
Fastify supports four types of HTTP request input:
1. The [**path parameters**](#path-parameters) are positional data, based on the endpoint’s URL format
2. The [**query string**](#query-string) is an additional part of the URL the client adds to provide variable data
3. The [**headers**](#the-headers) are additional key:value pairs that pair information passing between the client
and the server
4. The [**body**](#the-body) is the request payload that contains the client’s data submission

#### Path Parameters
The path parameters are variable pieces of a URL that could identify a resource in our application server.
It's used by prefacing ```:``` in front of the path subsegment:
Here we set two path parameters, for example.
```ts
app.get('/:userId/pets/:petId', function getPet (request,
reply) {
    reply.send(request.params)
})
```
The ```request.params``` object contains both parameters, important to notice that we may need, in ts, to type the params to make them acceptable for our routes
```ts
    fastify.get<
        {
            Params: {
                petId: string,
                userId: string
            }
        }>
    ('/:userId/pets/:petId', async (req, res) => {
        if (!req.params) return 400
        const { userId, petId } = req.params;
        res.send({userId, petId})
    })

    // or
    fastify.get('/:userId/pets/:petId', async (req: FastifyRequest< 
            {Params: {
                petId: string,
                userId: string
            }}>, res) => {
        if (!req.params) return 400
        const { userId, petId } = req.params;
        res.send({userId, petId})
    })
```
In addiction, it's important to remember that, by default, URL parameters can't be more than 100 chars and that we can limit that in the fastify instance opts
```ts
const app = fastify({
    maxParamLength: 40
})
```

#### Query String
The query string is an additional part of the URL string that the client can append after a question mark:

```http://localhost:8080/foo/bar?param1=one&param2=two```

These params let your clients submit information to those endpoints that don’t support the request payload, such as **GET** or **HEAD** **HTTP**.

Fastify supports basic 1:1 relation mapping, so a ```foo.bar=42``` query parameter produces a ```{"foo.bar":"42"}``` query object. Meanwhile, we should expect a nested object like this:
```ts
{
    "foo": {
        "bar": "42"
    }
}
```
To do so, we must change the default query string parser with ```qs```, a new external module, (https://www.npmjs.com/package/qs):
```ts
import qs from 'qs'
const app = fastify({
    querystringParser: function newParser (queryParamString)
    {
        return qs.parse(queryParamString, { allowDots: true })
    }
})
```
This setup unlocks a comprehensive set of new syntaxes that you can use in query strings such as arrays, nested objects, and custom char separators.

#### The Headers
The headers are a key-value map that can be read as a JavaScript object within the ```request.headers``` property. Note that, by default, Node.js will apply a lowercase format to every header’s key. So, if your
client sends to your Fastify server the ```CustomHeader: AbC header```, you must access it with the ```request.headers.customheader``` statement.

#### The Body
The request’s body can be read through the request.body property. Fastify handles two input content types:
1. The **application/json** produces a JavaScript object as a **body** value
2. The **text/plain produces** a string that will be set as a **request.body** value
Note that the request payload will be read for the POST, PUT, PATCH, OPTIONS, and DELETE HTTP methods. The GET and HEAD ones don’t parse the body, as per the HTTP/1.1 specification.
You can limit the body value globally in the **fastify instance** opts and overwrite it (or the default value) in the single route using the opt ```bodyLimit: valueInKb```.

### Managing the route's scope
In Fastify, an endpoint has two central aspects that you will set when defining a new route:
1. The **route configuration**
2. The **server instance**, where the route has been registered

The route’s scope is built on top of the server’s instance context where the entry point has been registered.
#### The Route Server Instance

When we talk about the route’s scope, we must consider the server instance where the route has been added. This information is important because it will define the following:

- The **handler execution context**
- The **request life cycle events**
- The **default route configuration**
They define the **route's scope** that cannot be modified after application startup.
For example:
```ts
app.get('/private', function handle (request, reply) {
    reply.send({ secret: 'data' })
})
app.register(function privatePlugin (instance, opts, next) {
    instance.addHook('onRequest', function isAdmin (request, reply, done) {
        if (request.headers['x-api-key'] === 'ADM1N') {
            done()
        } else {
            done(new Error('you are not an admin'))
        }
    })
    next()
})
// we can ofc use async instead
```
In this case ```isAdmin``` hook will never be executed calling the ```/private``` endpoint, since the route is defined at app scope.
We should have done:
```ts
app.register('/private', async (fastify, opts) {
    fastify.get('/', (request, reply) {
        reply.send({ secret: 'data' })
    })
    app.register(async function privatePlugin (instance, opts, next) {
        instance.addHook('onRequest', async function isAdmin (request, reply, done) {
            if (request.headers['x-api-key'] === 'ADM1N') {
            } else {
                return new Error('you are not an admin')
            }
        })
    })
})
```
To make it work for ```private``` endpoint.

#### Printing the Routes Tree
To reduce the stress, Fastify has a couple of debugging outputs and techniques that are helpful to unravel a complex code base and can be used like so:
```ts
app.ready()
   .then(
    function started() {
        console.log(app.printPlugins())
        console.log(app.printRoutes({commonPrefix: false}))
    }
   )

// or putting into an hook
server.addHook ( 'onReady' , async function preLoading () {
    console.log ( ' | onReady |' )
    console.log(server.printPlugins())
    console.log(server.printRoutes({commonPrefix: false}))
})
```

### Adding New Behaviors to Routes
At the beginning of this chapter, we learned how to use the **routeOptions** object to configure a route, but we did not talk about the **config** option!
 - Access the config in the handler and hook functions
 - Implement the Aspect- Oriented Programming (**AOP**) that we are going to see later

#### Access the route's configuration
With the ```routerOption.config``` parameter, you can specify a JSON that contains whatever you need and then it is possible to access it within the ```Request``` component in the handler/hook through the ```routeOptions.config``` field
```ts
async function operation(request, reply) {
    return request.routeOptions.config
}
app.get('/', {
    handler: operation,
    config: {
        hello: 'world'
    }
})
```
In this way, you can create a business logic that depends on modifying the components’ behavior.


## Working with Prisma for DB
1. [Install Fastify Plugin (optional)](#install-fastify-plugin-optional)
2. [Install Prisma](#install-prisma)
3. [Init Prisma](#init-prisma)
### Install Fastify Plugin (optional)
#### Install
I will use also **fastify-plugin** to easy the work, from now on.
Installing it is as simple as installing an npm module
```bash
npm i fastify-plugin
```
fastify-plugin can do three things for you:
- Add the skip-override hidden property
- Check the bare-minimum version of Fastify
- Pass some custom metadata of the plugin to Fastify
#### Usage
Example using callback
```ts
import fp from 'fastify-plugin'

module.exports = fp(function (fastify, opts, done) {
  // your plugin code
  done()
})
```
and unsing async
```ts
import fp from 'fastify-plugin'

// A callback function param is not required for async functions
module.exports = fp(async function (fastify, opts) {
  // Wait for an async function to fulfill promise before proceeding
  await exampleAsyncFunction()
})
```

#### Metadata
In addition, if you use this module when creating new plugins, you can declare the dependencies, the name, and the expected Fastify version that your plugin needs.
- **Fastify Version**:
    If you need to set a bare-minimum version of Fastify for your plugin, just add the [semver](https://github.com/npm/node-semver#ranges) range that you need:
    ```ts
    import fp from 'fastify-plugin'

    module.exports = fp(function (fastify, opts, done) {
    // your plugin code
    done()
    }, { fastify: '5.x' })
    ```
- **Name**: Fastify uses this option to validate the dependency graph, allowing it to ensure that no name collisions occur and making it possible to perform [dependency checks](https://github.com/fastify/fastify-plugin#dependencies).
    ```ts
    import fp from 'fastify-plugin'

    function plugin (fastify, opts, done) {
    // your plugin code
    done()
    }

    module.exports = fp(plugin, {
    fastify: '5.x',
    name: 'your-plugin-name'
    })
    ```
- **Dependencies**: You can also check if the plugins and decorators that your plugin intend to use are present in the dependency graph.
*Note: This is the point where registering name of the plugins become important, because you can reference plugin dependencies by their name.*
    ```ts
    import fp from 'fastify-plugin'

    function plugin (fastify, opts, done) {
    // your plugin code
    done()
    }

    module.exports = fp(plugin, {
    fastify: '5.x',
    decorators: {
        fastify: ['plugin1', 'plugin2'],
        reply: ['compress']
    },
    dependencies: ['plugin1-name', 'plugin2-name']
    })
    ```
- **Encapsulate**: By default, fastify-plugin breaks the [encapsulation](https://github.com/fastify/fastify/blob/HEAD/docs/Reference/Encapsulation.md) but you can optionally keep the plugin encapsulated. This allows you to set the plugin's name and validate its dependencies without making the plugin accessible.
    ```ts
    const fp = require('fastify-plugin')

    function plugin (fastify, opts, done) {
    // the decorator is not accessible outside this plugin
    fastify.decorate('util', function() {})
    done()
    }

    module.exports = fp(plugin, {
    name: 'my-encapsulated-plugin',
    fastify: '5.x',
    decorators: {
        fastify: ['plugin1', 'plugin2'],
        reply: ['compress']
    },
    dependencies: ['plugin1-name', 'plugin2-name'],
    encapsulate: true
    })
    ```
### Install Prisma
```bash
npm install prisma --save-dev 
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
```
- **prisma** - The Prisma CLI for running commands like prisma init, prisma migrate, and prisma generate, using npx
- **@prisma/client** - The Prisma Client library for querying your database
- **@prisma/adapter-better-sqlite3** - The node-sqlite driver adapter that connects Prisma Client to your database
- **dotenv** - Loads environment variables from your .env file

### Init Prisma
1. **Create the env file**
2. **Init prisma**
    ```bash
    npx prisma init --datasource-provider sqlite
    ```
3. **Populate schema.prisma**
4. **Do the initial migration**
    ```bash
    npx prisma migrate dev --name init
    ```
5. **Generate the client**
    ```bash
    npx prisma generate
    ```
6. **try**
    ```ts
    import fp from 'fastify-plugin'
    import { type FastifyPluginAsync } from 'fastify'
    import { PrismaClient } from '@prisma/client'

    // Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
    declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
    }

    const prismaPlugin: FastifyPluginAsync = fp(async (server, options) => {
    const prisma = new PrismaClient()

    await prisma.$connect()

    // Make Prisma Client available through the fastify server instance: server.prisma
    server.decorate('prisma', prisma)

    server.addHook('onClose', async (server) => {
        await server.prisma.$disconnect()
    })
    })

    export default prismaPlugin
    ```
    
    **To manage the application/x-www-form-urlencoded**
    ```bash
    npm i @fastify/formbody
    ```
    ```ts
    // in the main server
    import formBody from '@fastify/formbody

    await server.register(formBody)
    ```

## Using GoogleOAuth

### Register your app on Google Cloud Console
1) Login with your account to <a href="https://console.cloud.google.com/">https://console.cloud.google.com/</a>
2) Create a Project
3) Set up the OAuth consent screen
    - Api & Services -> OAuth consent screen
        - User type: external
        - App Name: ...
        - User Support mail: ...
        - Developer contact info: ...
    - Save
4) Create OAuth Credentials
    - Api & Services -> Credentials
        - Create Credentials -> OAuth client ID
            - App Type: web app
            - Name
            - Authorized redirect URI: add your redirect
        - Create
5) Put client id, secret and redirect URI in the .env

### Route the OAuth
Install packages for jwt
```bash
npm i axios jwt-decode
npm i -D @types/jwt-decode
```

Create a **auth.ts**
```ts
import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";

const AuthGoogle: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    const GOOGLE_REDIRECT_URI = 'http://localhost:5000/auth/google/callback';
    
    // Redirect to google
    fastify.get('/google', async (req, res) => {
        const ROOT_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

        const options = {
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'openid',
                'email',
                'profile',
            ].join(' '),
        };

        const qs = new URLSearchParams(options).toString();
        const url = `${ROOT_URL}?${qs}`;

        return res.redirect(url);
    })

    // 2) Google Callback
    fastify.get('/auth/google/callback', async (request, reply) => {
        const { code } = request.query as { code?: string };

        if (!code) {
            reply.code(400);
            return { error: 'Missing code parameter' };
        }

        try {
            // exchange the code with tokens
            const tokens = await getGoogleTokens(code);

            // Decode token ID (contains sub, email, name, picture, ecc.)
            const payload = decodeGoogleIdToken(tokens.id_token);

            const googleId = payload.sub;
            const email = payload.email;
            const name = payload.name ?? email.split('@')[0];

            // username: you can choose whatever logic you prefer here
            const usernameBase = name.replace(/\s+/g, '').toLowerCase();

            // upsert user on email (or googleId, as preferred)
            const user = await fastify.prisma.user.upsert({
                where: { email },              // update if exists
                update: {
                    googleId,
                    // googleSecret: saves refresh_token IF Google sends
                    googleSecret: tokens.refresh_token ?? undefined,
                },
                create: {
                    username: usernameBase,
                    email,
                    // hashedPw is optional:
                    hashedPw: null,
                    googleId,
                    // google not always sends
                    googleSecret: tokens.refresh_token ?? null,
                },
            });

            // HERE: create session (cookies or JWT)
            // pseudo-JWT example
            //
            // const token = fastify.jwt.sign({ userId: user.id });
            // reply.setCookie('session', token, {
            //   path: '/',
            //   httpOnly: true,
            //   sameSite: 'lax',
            // });
            //
            // then redirect to frontend (example):
            // return reply.redirect('http://localhost:5173/dashboard');

            return reply.send({
                message: 'Google login ok',
                user,
            });
        } catch (err) {
            fastify.log.error(err);
            reply.code(500);
            return { error: 'Google auth failed' };
        }
    });
};

export default AuthGoogle;
```
And helper fns
```ts
// src/helpers/googleOAuth.ts
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface GoogleTokensResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleIdTokenPayload {
  iss: string;
  sub: string;          // <- google id of the user
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

// Exchange "code" with tokens (access_token, id_token, ecc.)
export async function getGoogleTokens(code: string): Promise<GoogleTokensResponse> {
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
  params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
  params.append('grant_type', 'authorization_code');

  const { data } = await axios.post<GoogleTokensResponse>(
    'https://oauth2.googleapis.com/token',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return data;
}

// Decode ID token (JWT) and returns the payload (sub, email, name, ecc.)
export function decodeGoogleIdToken(idToken: string): GoogleIdTokenPayload {
  return jwtDecode<GoogleIdTokenPayload>(idToken);
}
```

## Using JWT Tokens
Using an *HTTP ONLY* token is usually the safest choice, expecially if you have a FE web.
### What is an HttpOnly cookie and why it's better
When an user logs in (pw or Google), the BE generates a JWT and puts it into a cookie
```Set-Cookie: session=<JWT>; HttpOnly; Secure; SameSite=...```
This has pro and cons
*Pros*:
- FE can't access the token via JS (it's not visible in document.cookie) -> harder to steal the token
- Browser sends automatically the token in every request towards the BE
*Cons*:
- ```CORS``` have to be managed
- Protection towards ```CSRF``` must be implemented (using the SameSite prop)

Using it it's pretty straightforward:
```bash
npm i @fastify/cookie
```
And then register it
```ts
import cookie from '@fastify/cookie'

await fastify.register(cookie, {
//   secret: process.env.COOKIE_SECRET, // opt, if you need signed cookies
})
```
The settings work this way
```ts
reply.setCookie('session', token, {
  httpOnly: true, // JS cannot read it
  secure: true,   // cookie works only with https, in dev should be false
  sameSite: 'lax', // to lower CSRF
  // sameSite: 'none', // if FE and BE are on different ports/addresses and therefore cross-site requests with cookies should be allowed. It requires secure: true
  path: '/', // which routes it works on
  maxAge: 60 * 60 * 24, // 1 giorno
})
```
### CORS + cookies
If the BE and the FE have different origins (for example FE http://localhost:5173 and BE http://localhost:3000), then to ensure that the cookies will be sent you should
- **BACKEND**:
    ```ts
    import cors from '@fastify/cors'

    await fastify.register(cors, {
    origin: ['http://localhost:5173'],
    credentials: true,
    })
    ```
- **FRONTEND**
    ```ts
    // fetch
    fetch('http://localhost:3000/api/v1/users/me', {
        credentials: 'include'
    })

    // or axios
    axios.get(url, { withCredentials: true })
    ```

### Authorization Flow
**Login**:
1) backend creates the JWT
2) it puts the JWT in the cookie ```session```
3) returns ```success: true``` but **NOT** the token in the JSON

Then the protected routes can read the cookies and verify the jwt with
```ts
await request.jwtVerify()
```
For example, to get the userId stored in it
```ts
const payload = fastify.jwt.verify<{ userId: number }>(token)
const userId = payload.userId
```

So, four our purpose, we can implement an helper fn to set up the cookie
```ts
function setAuthCookie(reply: any, token: string) {
  const isProd = process.env.NODE_ENV === 'production'

  reply.setCookie('session', token, {
    httpOnly: true,
    secure: isProd,                     // in dev: false
    sameSite: isProd ? 'none' : 'lax', // if prod and cross-site -> none
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  })
}
```
We need to save the userId into the token so we can easily log the user out using the id stored in it
```ts
// in /login
...
const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
setAuthCookie(reply, token)

return reply.send({
  success: true,
  user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
})

// in /logout
...
if (token) {
    try {
        const payload = fastify.jwt.verify<{ userId: number }>(token)
        userId = payload.userId
    } catch {
    // token scaduto/invalid: logout comunque? boh, penso di si
        reply.code(400)
        reply.send({ error: 'Invalid token' })
    }
}

reply.clearCookie('session', { path: '/' })
...
```
(We will update the isLoggedIn field in the db accordingly).



