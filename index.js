/*----------------------------------------------------------------------------------
 This project code was initially using sessions - the session code was commented out
 to use JWT, and there is also code for JWT stored to cookie ( w/cookie-parser)
 Three ways:
 - sessions  CODE IDENTIFIED BY ----
 - JWT
 - JWT to cookies   CODE IDENTIFIED BY ====
------------------------------------------------------------------------------------*/

//require("dotenv").config() // in package.json instead

const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
//===================================================================================
const session = require("express-session") // can comment out if using cookie-parser
//===================================================================================
const usersRouter = require("./users/users-router")

//==================================================================
// npm i cookie-parser is required as a dependency when working with
// JWT and not using sessions ( commented out code in this project )
// **("express-session") can be commented out if using cookie-parser

//const cookieParser = require("cookie-parser")

//==================================================================

const server = express()
const port = process.env.PORT || 5000

server.use(helmet())
server.use(cors())
server.use(express.json())

//=======================
//server.use(cookieParser()) // IF USING CAN COMMENT OUT server.use(session) below
//=======================
server.use(session({
	resave: false, // avoid recreating sessions that have not changed
	saveUninitialized: false, // comply with GDPR laws for setting cookies automatically
	secret: process.env.JWT_SECRET, // cryptographically sign the cookie
}))
//=======================

server.use(usersRouter)
server.use((err, req, res, next) => {
	console.log(err)
	
	res.status(500).json({
		message: "Something went wrong",
	})
})

server.listen(port, () => {
	console.log(`Running at http://localhost:${port}`)
})

// JSON WEB TOKEN================================================
// STATELESS AUTHENTICATION

// cryptographically secure way for 2 parties to exchange JSON data
// without any shared state
// done by using a signature( secret string )

// signature: asd3flk23j125p98uas5ff6oh34pih435p89aih
// data : { "username":"foo", "password":"bar" }

// JWT CONVENTION
// Convention for packaging JSON data and secret-string
// <header data>.<payload data>.<hash/signature>

// Base64 - encoding, not hashing or encryption

// JWT not used for sensitive data ( unless encrypted on top of JWT too )

// JWT can be used in place of session id's
// DOn't require state, don't require database lookup or network request

// Have to rely on the client side to delete the token ( drawback )
// Can't keep track of who's logged in
// Not always a better choice over sessions
// Having a "session" where a user can log out is very important

// Can give a JWT an expiration date
// Can be used alongside sessions
