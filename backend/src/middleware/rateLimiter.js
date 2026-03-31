/*import ratelimit from "../config/ustash.js"
const rateLimiter = async (req, res, next) => {
    //per user
    try{
        const ip = req.ip || req.headers["x-forwarded-for"] || "global"
        const {success} = await ratelimit.limit("ip");
        if(!success){
            return res.status(429).json(
                {message: "Too many requests, please try again later"})
        }

        next()

    }catch(error){
        console.log("Rate limiter error", error)
        next(error);
    }

}

export default rateLimiter;*/
const rateLimiter = (req, res, next) => next();
export default rateLimiter;