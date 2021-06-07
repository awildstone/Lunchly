/** Customer for Lunchly */

const db = require("../db");
const { ConnectionError, CustomerNotFoundError } = require("../errors");
const Reservation = require("./reservation");
const sanitizeSearchQuery = require("../helper");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** Set/Get notes for a customer. */

  set notes(data) {
    this._notes = data || ""
  }

  get notes() {
    return this._notes
  }

   /** Get/Set phone number. */

  set phone(number) {
    this._phone = number || null;
  }

  get phone() {
    return this._phone;
  }

  /** Gets formatted full name for Customer instance. */

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      throw new CustomerNotFoundError(`No such customer: ${id}`, 404);
    }

    return new Customer(customer);
  }

  /** find a customer by name (assumes firstName lastName as parameters). */
  static async findCustomerByName(name) {
    let [ firstName, lastName ] = sanitizeSearchQuery(name);

    const result = await db.query(
      `SELECT id FROM customers
        WHERE first_name=$1 AND last_name=$2`,
        [firstName, lastName]);
    
    // const customerID = result.rows[0].id;

    if (result.rows[0] === undefined) {
      throw new CustomerNotFoundError(`No such customer: ${name}`, 404);
    }

    return result.rows[0].id;;
  }

  /** Get the top 10 customers with the greatest number of reservations. */

  static async getBestCustomers() {
    const topIds = await Reservation.getTopReservations();
    const bestCustomers = await Promise.all(topIds.map(async id => await Customer.get(id)));

    if (bestCustomers.length === 0) {
      throw new ConnectionError('Could not get the list of best customers.', 522)
    }
    return bestCustomers
  }
  
  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      if (result.rows.length === 0 ) {
        throw new ConnectionError("Unable to add new customer.", 522);
      }
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
