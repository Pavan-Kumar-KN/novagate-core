import http from 'http';
import {checkapiKeyHeader} from './middlewares/headerChecker.js';

const server = http.createServer((req,res) =>{
    checkapiKeyHeader(req,res);
})

server.listen(8080 , () =>{
    console.log('novagate server is started')
});