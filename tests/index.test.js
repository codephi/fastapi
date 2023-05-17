const chai = require('chai');
const fastapi = require('../src/index');
const { expect } = chai;

// eslint-disable-next-line no-undef
describe('FastAPI', () => {
  // eslint-disable-next-line no-undef
  it('should return a FastAPI instance', () => {
    const app = new fastapi.FastAPI();
    expect(app).to.be.an.instanceof(fastapi.FastAPI);
  });

  // eslint-disable-next-line no-undef
  it('should return a FastAPI instance with routes', () => {
    const app = new fastapi.FastAPI({
      routes: [
        {
          method: 'GET',
          path: '/test',
          handler: (req, res) => {
            res.send('Hello world!');
          }
        }
      ]
    });
    expect(app).to.be.an.instanceof(fastapi.FastAPI);
    expect(app.routes).to.be.an('array');
    expect(app.routes).to.have.lengthOf(1);
  });
});
