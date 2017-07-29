var mongoose = require('mongoose');
var AppUtil = require('../libs/AppUtil');
var Schema = mongoose.Schema;

var statusEnum = [
  'new',
  'complete'
];

var Item = new Schema({
  status: {type: String, required: true, enum: statusEnum},
  content: {type: String, required: false}
});

var Note = new Schema(
  {
    title: {type: String, required: true},
    status: {type: String, required: true, enum: statusEnum},
    bgColor: {type: String, required: true},
    items: [Item]
  },
  {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}}
);

/**
 * Defines the schema for the note model
 */
module.exports = mongoose.model('note', Note);