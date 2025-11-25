import { checkapiKeyHeader } from "./headerChecker.js";

const middlewares = [checkapiKeyHeader];

function use(middleware){
    middlewares.push(middleware);
}

function runMiddleware(req, res) {
    let index = 0;

    function next(){
        const middleware = middlewares[index];
        index++;


        if(!middleware) return ;

        middleware(req, res, next);
    }

    next();
}


export {
    use,
    runMiddleware
}
