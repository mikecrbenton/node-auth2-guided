const jwt = require("jsonwebtoken")

const roles = ["basic","admin"] // NEED TO BE IN THE PROPER ORDER FOR ACCESS

function restrict( role ) {
	return async (req, res, next) => {
		try {
			// express-session will automatically get the session ID from the cookie
         // header, and check to make sure it's valid and the session for this user exists.
         // USING JWT INSTEAD------------------
			// if (!req.session || !req.session.user) {
			// 	return res.status(401).json({
			// 		message: "Invalid credentials",
			// 	})
         // }
         // -----------------------------------

         // GET THE TOKEN VALUE FROM A MANUAL REQUEST "HEADER" 
         const token = req.headers.authorization

         // USING COOKIE-PARSER / SAVING TO COOKIE======================= 
         // GET THE TOKEN VALUE FROM A COOKIE - AUTO SENT FROM THE CLIENT
         //const token = req.cookies.token // if using comment out const token above
         // ============================================================= 

         // CHECK NOT EMPTY
         if(!token) {
            return res.status(401).json({ message: "Invalid Credentials"})
         }
         // VERIFY SIGNATURES MATCH - DIDN'T CHANGE
         // jwt.verify(token, secretOrPublicKey,[options, callback])
         jwt.verify(token, process.env.JWT_SECRET, (err,decoded)=>{
            // TOKEN DIDN'T VERIFY
            if(err){
               return res.status(401).json({ message:"Invalid Credentials"})
            }

            // CHECK FOR ADMIN PERMISSIONS WITH INDEX BASED SCALE
            //if(role && decoded.userRole !== role){}  --> another way of checking w/o array

            //if( admin && roles[0] < roles[1])  
            if( role && roles.indexOf(decoded.userRole) < roles.indexOf(role) ) {
               return res.status(401).json({ message:"Invalid Credentials"})
            }

            // MAKE TOKEN'S PAYLOAD AVAILABLE TO OTHER MIDDLEWARE OR ROUTE HANDLERS
            req.token = decoded
            //console.log(decoded)

            // USER PASSED - CAN ALLOW ACCESS
            next() // make sure inside of the callback
         })

			//next() -> WITH JWT NEXT NEEDS TO BE WITHIN THE jwt.verify() BLOCK
		} catch(err) {
			next(err)
		}
	}
}

module.exports = {
	restrict,
}
