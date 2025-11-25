import http from 'http';
import { runMiddleware} from './middlewares/runner.js';

const server = http.createServer((req, res) => {
    runMiddleware(req, res);

    // If no middleware ended the response:
    res.statusCode = 200;
    res.end("You are authorized!");
})

server.listen(8080, () => {
    console.log('novagate server is started')
});