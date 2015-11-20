'use strict';

const { remove } = require('../schema/fusion_protocol');

const Joi = require('joi');
const r = require('rethinkdb');

const make_reql = (raw_request, metadata) => {
  const { value: { data, collection }, error } = Joi.validate(raw_request.options, remove);
  if (error !== null) { throw new Error(error.details[0].message); }

  const table = metadata.get_table(collection);
  return r.table(table.name)
          .getAll(r.args(data.map((row) => row.id)), { index: 'id' })
          .delete();
};

// This is also used by the 'replace' and 'update' endpoints
const handle_response = (request, response, send_cb) => {
  if (response.errors !== 0) {
    send_cb({ error: response.first_error });
  } else {
    send_cb({ data: request.raw.options.data.map((row) => row.id), state: 'complete' });
  }
};

module.exports = { make_reql, handle_response };
