class MyPromise {
    state = 'Pending';
    cbs = [];
  
    exec() {
      queueMicrotask(
        () => {
          while (this.cbs.length) {
            this.cbs.shift()(this.state, this.value, this.error);
          }
        }
      )
  
    }
    constructor(executor) {
      const resolve = value => {
        if (this.state === 'Pending') {
          this.value = value;
          this.state = 'Fulfilled';
          this.exec();
        }
      };
  
  
      const reject = error => {
        if (this.state !== 'Fulfilled') {
          this.error = error;
          this.state = 'Rejected';
          this.exec();
        }
      };
  
      try {
        let ingore = 1;
        executor((v) => {
          if (--ingore === 0) {
            this.resolvePromise(this, v, resolve, reject);
          }
        }, (error) => {
          if (--ingore === 0) {
            reject(error);
          }
        });
      } catch (e) {
        reject(e);
      }
  
    }
  
    static resolve(value) {
      return new MyPromise(resolve => resolve(value));
    }
  
    static reject(value) {
      return new MyPromise((resolve, reject) => reject(value));
    }
  
    resolvePromise(promise2, x, resolve, reject) {
      if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise!'));
      }
  
      if (x instanceof MyPromise) {
       return x.then(resolve, reject);
      }
      if (x && (typeof x === 'object' || typeof x === 'function')) {
        try {
          var then = x.then;
          var called
          if (typeof then === 'function') {
            then.call(x, (y) => {
              if (called) {
                return;
              }
              called = true;
              return this.resolvePromise(promise2, y, resolve, reject);
            }, (r) => {
              if (called) {
                return;
              }
              called = true;
              return reject(r);
            });
          } else {
            resolve(x);
          }
        } catch (e) {
          if (called) {
            return;
          }
          called = true;
          return reject(e);
        }
      } else {
        resolve(x);
      }
    }
    then(onFulfilled, onRejected) {
      const promise = new MyPromise(
        (resolve, reject) => {
          const run = (state, value, error) => {
            const v = state === 'Fulfilled' ? value : error;
            if (state === 'Fulfilled' && typeof onFulfilled !== 'function') {
              return resolve(value);
            }
            if (state === 'Rejected' && typeof onRejected !== 'function') {
              return reject(error);
            }
            let fn = v => v;
            if (state === 'Fulfilled') {
              fn = onFulfilled;
            } else if (state === 'Rejected') {
              fn = onRejected;
            }
            try {
              const value = fn(v);
              resolve(value);
            } catch (e) {
              reject(e);
            }
          }
          this.cbs.push(run);
  
        }
      );
      if (this.state !== 'Pending') {
        this.exec();
      }
      return promise;
  
    }
  }

  module.exports = MyPromise;
