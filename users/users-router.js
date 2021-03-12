const express = require("express")
const bcrypt = require("bcryptjs")
const Users = require("./users-model")
const { restrict } = require("./users-middleware")
const jwt = require("jsonwebtoken") // 3rd party

const router = express.Router()

router.get("/users", restrict("admin"), async (req, res, next) => {
	try {
		res.json(await Users.find())
	} catch(err) {
		next(err)
	}
})

router.post("/users", async (req, res, next) => {
	try {
		const { username, password } = req.body
		const user = await Users.findByUsername(username)

		if (user) {
			return res.status(409).json({
				message: "Username is already taken",
			})
		}

		const newUser = await Users.add({
			username,
			// hash the password with a time complexity set to the system (.env variable )
			password: await bcrypt.hash(password, process.env.BCRYPT_TIME_COMPLEXITY),
		})

		res.status(201).json(newUser)
	} catch(err) {
		next(err)
	}
})

router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body
		const user = await Users.findByUsername(username)
		
		if (!user) {
			return res.status(401).json({
				message: "Invalid Credentials",
			})
		}

		// hash the password again and see if it matches what we have in the database
		const passwordValid = await bcrypt.compare(password, user.password)

		if (!passwordValid) {
			return res.status(401).json({
				message: "Invalid Credentials",
			})
		}
      // USING JWT INSTEAD------------------
		// generate a new session for this user,
		// and sends back a session ID
      //req.session.user = user
      //------------------------------------

      // jwt.sign( payload, secretOrPrivateKey, [options,callback])
      const token = jwt.sign({ userID: user.id, userRole: user.role}, process.env.JWT_SECRET)

      // OPTION TO SET JWT TO COOKIE=================================
      // res.cookie("token", token) // <-- THIS IS ALL YOU NEED TO SET A COOKIE
      // - If using this take the token out of res.json object below
      //   a token will not come back in the body, but set in cookies
      // ============================================================


		res.json({
         message: `Welcome ${user.username}!`, 
         token: token // TOKEN IS RETURNED IN THE RESPONSE BODY======
		})
	} catch(err) {
		next(err)
	}
})

router.get("/logout", async (req, res, next) => {
	try {
		// this will delete the session in the database and try to expire the cookie,
		// though it's ultimately up to the client if they delete the cookie or not.
		// but it becomes useless to them once the session is deleted server-side.
		req.session.destroy((err) => {
			if (err) {
				next(err)
			} else {
				res.status(204).end()
			}
		})
	} catch (err) {
		next(err)
	}
})

module.exports = router