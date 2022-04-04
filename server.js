const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const compression = require("compression");
const flash = require("express-flash");

const logger = require("morgan");
const helmet = require("helmet");

//const actions = require("./server.actions");

dotenv.config({ path: ".env" });

/**
 * Create Express server.
 */
const app = express();
/* app.use(function(request, response, next) {
    if (!request.secure) {
        return response.redirect("https://" + request.headers.host + request.url);
    }
    next();
}); */
/* app.get("*", function(req, res) {
    res.redirect("https://" + req.headers.host + req.url);
}); */
const default_port = 8080;
/* if (process.env.NODE_ENV !== "development") {
    const enforce = require("express-sslify");
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
} */

/**
 * Connect to PG.
 */
const pg = require("pg");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);

const config1 = {
    connectionString: process.env.PG_URI,
    max: 5,
    idleTimeoutMillis: 1,
    connectionTimeoutMillis: 2000,
};

const config2 = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    /* ssl: {
        rejectUnauthorized: true,
    }, */
};
//ssl: false,

const pgPool = new pg.Pool(config1);
/* const pgPool = new pg.Pool({
    connectionString: process.env.PG_URI,
    ssl: {
        rejectUnauthorized: false,
    },
}); */

const pgStore = new pgSession({
    pool: pgPool,
    tableName: "session_auth",
});

/**
 * Express configuration.
 */
function normalizedPort(defaultPort) {
    const port = process.env.PORT || defaultPort;
    if (!Number.isInteger(parseInt(port))) return defaultPort;
    return port;
}

app.set("host", process.env.HOST || "localhost");
app.set("port", normalizedPort(process.env.PORT || default_port));
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
/* app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://ajax.googleapis.com", "https://stackpath.bootstrapcdn.com"],
                styleSrc: ["'self'"],
                imgSrc: ["*", "data:"],
                connectSrc: ["'self'"],
                frameSrc: ["'self'"],
            },
        },
    })
); */

app.use(
    expressSession({
        store: pgStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        cookie: { maxAge: 3 * 24 * 60 * 60 * 1000 }, // 3 days
    })
);

app.disable("x-powered-by");
if (process.env.NODE_ENV === "development") {
    /*  const cors = require("cors");
    app.use(cors()); */
}
const cors = require("cors");
app.use(cors());

/**
 * Primary app routes.
 */
const { authJwt, verifySignUp, formsValidator } = require("./server/middleware");
const controller = require("./server/controllers/auth.controller");
const { getVerifyEmailToken, getVerifyEmail } = require("./server/controllers/email.controller");
const { supers, users } = require("./server/models/common.model");
const { validateSignUpForm, validateToString } = require("./server/middleware/formsValidator");
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, s-access-token, Origin, Content-Type, Accept");
    next();
});

/**
 * Account
 */
const useAddSuper = process.argv.indexOf("addsuper");
let blockListen = false;
if (useAddSuper !== -1) {
    (async() => {
        const body = { username: "super" };
        const req = { sessionStore: { pool: pgPool } };
        process.argv.forEach((val, index) => {
            const spl = val.split("=");
            if (spl.length != 2) return;
            body[spl[0]] = spl[1];
        });
        if (!body.email) {
            console.log("email arg requests");
        } else if (!body.password) {
            console.log("password arg requests");
        } else if (await supers.findByEmail(req, body.email)) {
            console.log("user with " + body.email + " email already exists");
        } else if (validateSignUpForm(body)) {
            const errors = validateToString(validateSignUpForm(body));
            console.log("registration error: " + JSON.stringify(errors));
        } else {
            await controller.superup(req, body);
            console.log("user " + body.email + " successfully registered");
        }
        process.exit(1);
    })();
    //process.exit(1);
    blockListen = true;
}

app.post(
    "/signup", [formsValidator.validateSignUpFormMiddleware, verifySignUp.checkDuplicateUsernameOrEmail],
    (req, res) => {
        controller.signup(req, res);
    }
);
app.post("/admin/login", [formsValidator.validateSignInFormMiddleware], controller.superin);
app.put("/admin/login", [supers.verifyToken], controller.signresponse);
app.post("/admin/logout", controller.superout);
app.get("/admin/users", [supers.verifyToken], async(req, res) => {
    try {
        const result = await pgPool.query(`
        select COALESCE(email, '') as email, COALESCE(username, '') as username, id from users
        `);
        res.status(200).send(result.rows);
    } catch (err) {
        res.status(500).send(err);
        console.log(err);
    }
});

app.post("/login", [formsValidator.validateSignInFormMiddleware], controller.signin);
app.put("/login", [users.verifyToken], controller.signresponse);
app.post("/logout", controller.signout);

app.post("/profile/verify", [users.verifyToken], getVerifyEmail);
app.post("/profile/verify/:token", [users.verifyToken], getVerifyEmailToken);

/**
 * Static app paths.
 */
app.use(
    express.static(path.join(__dirname, "client", "build"), {
        maxAge: 31557600000,
    })
);
app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
var enforce = require("express-sslify");
app.use(enforce.HTTPS({ trustProtoHeader: true }));
if (process.env.NODE_ENV === "production") {
    /* 
            app.use(express.static(path.join(__dirname, "client/build")));

            app.get("*", function(req, res) {
                res.sendFile(path.join(__dirname, "client/build", "index.html"));
            }); */
    /* 
  app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
}); */
}

/* app.use(express.static(path.join(__dirname, "client/build")));

        app.get("*", function(req, res) {
            res.sendFile(path.join(__dirname, "client/build/index.html"));
        }); */

/* app.use(express.static(path.join(__dirname, "public")));

        app.get("*", function(req, res) {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        }); */

/**
 * Error Handler.
 */
const errorHandler = require("errorhandler");
app.use(errorHandler());
/* if (process.env.NODE_ENV === "development") {
            const errorHandler = require("errorhandler");
            app.use(errorHandler());
        } else {
            app.use((err, req, res, next) => {
                console.error(err);
                res.status(500).send("Server Error");
            });
        } */

/**
 * Start Express server.
 */
if (!blockListen) {
    const http = require("http");
    const https = require("https");
    const fs = require("fs");
    const pem = require("pem");

    (async() => {
        /* const { key, cert } = await (async() => {
                    return new Promise((res, rej) => {
                        pem.createCertificate({ days: 1, selfSigned: true }, function(err, keys) {
                            if (err) {
                                rej();
                            } else {
                                res({ key: keys.serviceKey, cert: keys.certificate });
                            }
                        });
                    });
                })(); */
        const key = fs.readFileSync("key.pem");
        const cert = fs.readFileSync("cert.pem");

        const httpsServer = http.createServer(app);
        /* const httpsServer = https.createServer({
                key: key,
                cert: cert,
            },
            app
        ); */
        httpsServer.listen(app.get("port"), () => {
            console.log("HTTPS Server running on port " + app.get("port"));
        });
    })();
}

/*   app.listen(app.get("port"), () => {
                console.log(`Server is listening on ${app.get("host")}:${app.get("port")}`);
                console.log("  Press CTRL-C to stop\n");
            }); */

module.exports = app;