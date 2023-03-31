import { Request, Response } from 'express';

console.log('fubar');
const ssrMiddleware = (request: Request, response: Response) => {
  response.send('des');
};
export default ssrMiddleware;
