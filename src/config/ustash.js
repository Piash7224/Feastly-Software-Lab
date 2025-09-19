import {Ratelimit} from "@upstash/ratelimit"
import {Redis} from "@upstash/redis"

import dotenv from "dotenv"
dotenv.config();

//create a new ratelimiter, that allows 100 requests per 60 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "60 s"),
});

const ratelimiter = async (req, res, next) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"] || "global";
        const { success } = await ratelimit.limit(ip);

        if(success){
            return res.status(429).json({message: "Too many requests, please try again later."});
        }
        
        next();
    }catch (error) {
        console.error("Rate Limiter Error:", error);
        //dont block requests if there is an error with the rate limiter
        next();
    }
}

export default ratelimit;

