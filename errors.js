class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
        this.name = "ExpressError";
    }
}

class NotFoundError extends ExpressError {
    constructor(message, status) {
        super(message, status);
        this.name = "NotFoundError";
      }
}

class CustomerNotFoundError extends ExpressError {
    constructor(message, status) {
        super(message, status);
        this.name = "CustomerNotFoundError";
      }
}

class ReservationNotFoundError extends ExpressError {
    constructor(message, status) {
        super(message, status);
        this.name = "ReservationNotFoundError";
      }
}

class ConnectionError extends ExpressError {
    constructor(message, status) {
        super(message, status);
        this.name = "ConnectionError";
      }
}

class InvalidInputError extends ExpressError {
    constructor(message, status) {
        super(message, status);
        this.name = "InvalidInputError";
      }
}

module.exports = { NotFoundError, CustomerNotFoundError, ReservationNotFoundError, ConnectionError, InvalidInputError } 