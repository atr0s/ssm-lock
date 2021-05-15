const AWS = require('aws-sdk')

class SSMLock {
  constructor (lockName, { timeout = 60, debug = false }) {
    this.parameterName = lockName
    this.debug = debug
    this.timeout = timeout;
  }

  returnFalse (err) {
    if (this.debug) {
      console.debug('debug: ' + JSON.stringify(err))
    }
    return false
  }

  returnTrue (result) {
    if (this.debug) {
      console.debug('debug: ' + JSON.stringify(result))
    }
    return true
  }

  async clearStaleLock () {
    const params = {
      Name: this.parameterName
    }
    return this.ssm().getParameter(params).promise().then(r => {
      const now = Date.now();
      const parameterDate = Date.parse(r.Parameter.LastModifiedDate.toUTCString());
      const delta = (now - parameterDate) / 1000;
      if (delta > this.timeout) {
        if (this.debug) {
          console.debug('Clearing stale lock');
        }
        this.releaseLock();
      }
      return true
    }).catch(this.returnFalse.bind(this));
  }

  async acquireLock () {
    await this.clearStaleLock();
    const params = {
      Name: this.parameterName,
      Overwrite: false,
      Value: `${this.timeout}`,
      Type: 'String'
    }
    return this.ssm().putParameter(params).promise()
      .then(this.returnTrue.bind(this))
      .catch(this.returnFalse.bind(this));
  }

  async releaseLock () {
    const params = {
      Name: this.parameterName
    }
    return this.ssm().deleteParameter(params).promise()
      .then(this.returnTrue.bind(this))
      .catch(this.returnFalse.bind(this));
  }

  ssm () {
    if (!this._ssm) {
      this._ssm = new AWS.SSM({ apiVersion: '2014-11-06' });
      return this._ssm;
    } else {
      return this._ssm;
    }
  }
}

module.exports = SSMLock
