global.RequestError = class RequestError extends Error {
    copyObject(requestError) {
      this.errorList = requestError.errorList;
    }
  
    constructor(message, code, realError) {
      if (realError instanceof RequestError) {
        super(realError.message, realError.code)
        this.copyObject(realError)
        return;
      }
      if (!code)
        code = 500;
      super(message, code);
      this.status = code;
      this.errorList = [];
      if (message instanceof Array) {
        for (var i = 0; i < message.length; i++) {
          this.errorList.push(message[i])
        }
      } else {
        this.errorList.push(message);
      }
      var trace = this.stack; // Use the Error stack trace
      var consoleMessage = message;
      if (realError)
        consoleMessage = realError;
      console.error('\x1b[31mRequestError\x1b[0m', consoleMessage, trace);
    }
  };
  