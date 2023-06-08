import { FastAPI } from '../src/index';

describe('FastAPI', () => {
  it('should return a FastAPI instance', () => {
    const app = new FastAPI();
    expect(app).toBeInstanceOf(FastAPI);
  });

  it('should return a FastAPI instance with routes', () => {
    const app = new FastAPI({
      routes: [
        {
          method: 'GET',
          path: '/test',
          handler: (req: any, res: any) => {
            res.send('Hello world!');
          }
        }
      ]
    });
    expect(app).toBeInstanceOf(FastAPI);
    expect(app.routes).toBeInstanceOf(Array);
    expect(app.routes).toHaveLength(1);
  });
});
