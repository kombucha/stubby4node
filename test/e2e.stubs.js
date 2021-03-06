'use strict';

var Stubby = require('../src/main').Stubby;
var fs = require('fs');
var yaml = require('js-yaml');
var endpointData = yaml.load((fs.readFileSync('test/data/e2e.yaml', 'utf8')).trim());
var waitsFor = require('./helpers/waits-for');
var assert = require('assert');
var createRequest = require('./helpers/create-request');

describe('End 2 End Stubs Test Suite', function () {
  var sut = null;
  var port = 8882;

  function stopStubby(finish) {
    if (sut != null) {
      return sut.stop(finish);
    }
    return finish();
  }

  beforeEach(function (done) {
    this.context = {
      done: false,
      port: port
    };

    function finish() {
      sut = new Stubby();
      sut.start({
        data: endpointData
      }, done);
    }

    stopStubby(finish);
  });

  afterEach(stopStubby);

  describe('basics', function () {
    it('should return a basic GET endpoint', function (done) {
      var self = this;
      this.context.url = '/basic/get';
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        done();
      });
    });

    it('should return a basic PUT endpoint', function (done) {
      var self = this;
      this.context.url = '/basic/put';
      this.context.method = 'put';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        done();
      });
    });

    it('should return a basic POST endpoint', function (done) {
      var self = this;
      this.context.url = '/basic/post';
      this.context.method = 'post';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        done();
      });
    });

    it('should return a basic DELETE endpoint', function (done) {
      var self = this;
      this.context.url = '/basic/delete';
      this.context.method = 'delete';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        done();
      });
    });

    it('should return a basic HEAD endpoint', function (done) {
      var self = this;
      this.context.url = '/basic/head';
      this.context.method = 'head';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        done();
      });
    });

    it('should return a response for an endpoint with multiple methods', function (done) {
      var self = this;
      this.context.url = '/basic/all';
      this.context.method = 'delete';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'all endpoint delete to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        self.context = {
          port: port,
          finished: false,
          url: '/basic/all',
          method: 'get'
        };

        createRequest(self.context);

        return waitsFor(function () {
          return self.context.done;
        }, 'all endpoint get to finish', 1000, function () {
          assert(self.context.response.statusCode === 200);

          self.context = {
            port: port,
            finished: false,
            url: '/basic/all',
            method: 'put'
          };

          createRequest(self.context);

          waitsFor(function () {
            return self.context.done;
          }, 'all endpoint put to finish', 1000, function () {
            assert(self.context.response.statusCode === 200);

            self.context = {
              port: port,
              finished: false,
              url: '/basic/all',
              method: 'post'
            };

            createRequest(self.context);

            waitsFor(function () {
              return self.context.done;
            }, 'all endpoint post to finish', 1000, function () {
              assert(self.context.response.statusCode === 200);
              done();
            });
          });
        });
      });
    });

    it('should return the CORS headers', function (done) {
      var self = this;
      var expected = 'http://example.org';
      this.context.url = '/basic/get';
      this.context.method = 'get';
      this.context.requestHeaders = {
        origin: expected
      };

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        var headers = self.context.response.headers;

        assert(headers['access-control-allow-origin'] === expected);
        assert(headers['access-control-allow-credentials'] === 'true');
        done();
      });
    });

    it('should return multiple headers with the same name', function (done) {
      var self = this;
      var expected = ['type=ninja', 'language=coffeescript'];
      this.context.url = '/duplicated/header';
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        var headers = self.context.response.headers;
        assert.deepEqual(headers['set-cookie'], expected);
        done();
      });
    });
  });

  describe('GET', function () {
    it('should return a body from a GET endpoint', function (done) {
      var self = this;
      this.context.url = '/get/body';
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.data === 'plain text');
        done();
      });
    });

    it('should return a body from a json GET endpoint', function (done) {
      var self = this;
      this.context.url = '/get/json';
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.data.trim() === '{"property":"value"}');
        assert(self.context.response.headers['content-type'] === 'application/json');
        done();
      });
    });

    it('should return a 420 GET endpoint', function (done) {
      var self = this;
      this.context.url = '/get/420';
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 420);
        done();
      });
    });

    it('should be able to handle query params', function (done) {
      var self = this;
      this.context.url = '/get/query';
      this.context.query = {
        first: 'value1 with spaces!',
        second: 'value2'
      };
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 200);
        done();
      });
    });

    it('should return 404 if query params are not matched', function (done) {
      var self = this;
      this.context.url = '/get/query';
      this.context.query = {
        first: 'invalid value',
        second: 'value2'
      };
      this.context.method = 'get';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 404);
        done();
      });
    });
  });

  describe('post', function () {
    it('should be able to handle authorized posts', function (done) {
      var self = this;
      this.context.url = '/post/auth';
      this.context.method = 'post';
      this.context.post = 'some=data';
      this.context.requestHeaders = {
        authorization: 'Basic c3R1YmJ5OnBhc3N3b3Jk'
      };

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 201);
        assert(self.context.response.headers.location === '/some/endpoint/id');
        assert(self.context.response.data === 'resource has been created');
        done();
      });
    });

    it('should be able to handle authorized posts where the yaml wasnt pre-encoded', function (done) {
      var self = this;
      this.context.url = '/post/auth/pair';
      this.context.method = 'post';
      this.context.post = 'some=data';
      this.context.requestHeaders = {
        authorization: 'Basic c3R1YmJ5OnBhc3N3b3JkWjBy'
      };

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'request to finish', 1000, function () {
        assert(self.context.response.statusCode === 201);
        assert(self.context.response.headers.location === '/some/endpoint/id');
        assert(self.context.response.data === 'resource has been created');
        done();
      });
    });
  });

  describe('put', function () {
    it('should wait if a 2000ms latency is specified', function (done) {
      var self = this;
      this.timeout(3500);
      this.context.url = '/put/latency';
      this.context.method = 'put';

      createRequest(this.context);

      waitsFor(function () {
        return self.context.done;
      }, 'latency-ridden request to finish', [2000, 3000], function () {
        assert(self.context.response.data === 'updated');
        done();
      });
    });
  });

  describe('file use', function () {
    describe('response', function () {
      it('should handle fallback to body if specified response file cannot be found', function (done) {
        var self = this;
        this.context.url = '/file/body/missingfile';

        createRequest(this.context);

        waitsFor(function () {
          return self.context.done;
        }, 'body-fallback request to finish', 1000, function () {
          assert(self.context.response.data === 'body contents!');
          done();
        });
      });

      it('should handle file response when file can be found', function (done) {
        var self = this;
        this.context.url = '/file/body';

        createRequest(this.context);

        waitsFor(function () {
          return self.context.done;
        }, 'body-fallback request to finish', 1000, function () {
          assert(self.context.response.data.trim() === 'file contents!');
          done();
        });
      });
    });

    describe('request', function () {
      it('should handle fallback to post if specified request file cannot be found', function (done) {
        var self = this;
        this.context.url = '/file/post/missingfile';
        this.context.method = 'post';
        this.context.post = 'post contents!';

        createRequest(this.context);

        waitsFor(function () {
          return self.context.done;
        }, 'post-fallback request to finish', 1000, function () {
          assert(self.context.response.statusCode === 200);
          done();
        });
      });

      it('should handle file request when file can be found', function (done) {
        var self = this;
        this.context.url = '/file/post';
        this.context.method = 'post';
        this.context.post = 'file contents!';

        createRequest(this.context);

        waitsFor(function () {
          return self.context.done;
        }, 'post-fallback request to finish', 1000, function () {
          assert(self.context.response.statusCode === 200);
          done();
        });
      });
    });
  });
});
