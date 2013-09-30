/*!
 * Mongoose Timestamps Plugin
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * Original work Copyright(c) 2012 Brian Noguchi
 * MIT Licensed
 */

var BinaryParser = require('bson').BinaryParser;

var deletedPath = 'deletedAt';

exports = module.exports = function(schema, options) {
  if (schema.path('_id')) {
    schema.add({
      updatedAt: Date
    });
    schema.virtual('createdAt')
      .get( function () {
        if (this._createdAt) return this._createdAt;
        return this._createdAt = this._id.getTimestamp();
      });
    schema.pre('save', function (next) {
      if (this.isNew) {
        this.updatedAt = this.createdAt;
      } else {
        this.updatedAt = new Date;
      }
      next();
    });
  } else {
    schema.add({
        createdAt: Date
      , updatedAt: Date
    });
    schema.pre('save', function (next) {
      if (!this.createdAt) {
        this.createdAt = this.updatedAt = new Date;
      } else {
        this.updatedAt = new Date;
      }
      next();
    });
  }
}


exports.install = function(mongoose) {
  var originalCast;

  originalCast = mongoose.Query.prototype.cast;
  mongoose.Query.prototype.cast = function(model, obj) {
    if (this.op !== 'remove') {
      obj || (obj = this._conditions);
      this.where(deletedPath, {
        $exists: false
      });
    }
    return originalCast(model, obj);
  };
  return true;
};
