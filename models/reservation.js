/** Reservation for Lunchly */

const moment = require("moment");
const db = require("../db");
const { InvalidInputError } = require("../errors");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** Get/Set startAt time. */

  set startAt(time) {
    if (time instanceof Date && !isNaN(time)) {
      this._startAt = time;
    } else {
      throw new InvalidInputError("Reservation start time must have a valid date.", 400);
    }
  }

  get startAt() {
    return this._startAt;
  }

  /** Get/Set numGuests */

  set numGuests(num) {
    if (num < 1) {
      throw new InvalidInputError("You cannot make a reservation with less than 1 guests.", 400);
    }
    this._numGuests = num;
  }

  get numGuests() {
    return this._numGuests
  }

  /** Set/Get notes for a reservation. */

  set notes(data) {
    this._notes = data || ""
  }

  get notes() {
    return this._notes
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** Get the customer ids for the current top 10 customers with the highest number of reservations. */

  static async getTopReservations() {
    const results = await db.query(
      `SELECT customer_id, COUNT(*) FROM reservations
        GROUP BY customer_id
        ORDER BY COUNT(*) DESC
        LIMIT 10;`
    );
    if (results.rows.length === 0 ) {
      throw new ConnectionError("Unable to get top 10 reservations list.", 522);
    }
    return results.rows.map(row => row.customer_id)
  }

  /** save this reservation */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      if (result.rows.length === 0 ) {
        throw new ConnectionError("Unable to add new reservation.", 522);
      }
      this.id = result.rows[0].id;
    } else {
      //update an existing reservation - not fully
      await db.query(
      `UPDATE reservations
        SET customer_id=$1, start_at=$2, num_guests=$3, notes=$4
        WHERE id=$5`,
      [this.customerId, this.startAt, this.numGuests, this.notes, this.id]);
    }
  }
}


module.exports = Reservation;
