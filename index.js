var HashRing = require('hashring'),
    _ = require('underscore');

function FixedPositionHashRing(args) {
    this.servers = args;
    this.mappings = {};

    var hasMapping = _.some(args, function(val) {
        return val.hashName != null;
    });

    if (_.isObject(args) && hasMapping) {
        this.servers = {};
        _.each(args, function(value, key) {
            var mapping = value.hashName;
            if (mapping != null) {
                this.mappings[mapping] = key;
                this.servers[mapping] = value;
            } else {
                this.servers[key] = value;
            }
        }, this);
    }

    this.ring = new HashRing(this.servers);
};

FixedPositionHashRing.prototype._getMappedServer = function(mapping) {
    var mapped = this.mappings[mapping];

    if (mapped == null) {
        return mapping;
    } else {
        return mapped;
    }
};

FixedPositionHashRing.prototype._getMappingFromServer = function(server) {
    var mapping = _.find(this.mappings, function(val) {
        return val === mapping;
    });

    if (mapping == null) {
        return server;
    } else {
        return mapping;
    }
};

FixedPositionHashRing.prototype.getNode = function(key) {
    var server = this.ring.getNode(key);

    return this._getMappedServer(server);
};

FixedPositionHashRing.prototype.createRange = function(key, size, distinct) {
    var range = this.ring.createRange(key, size, distinct);

    return _.map(range, this._getMappedServer.bind(this));
};

FixedPositionHashRing.prototype.addServer = function(server, weights, vnodes) {
    var mapping = this._getMappingFromServer(server);
    return this.ring.addServer(mapping, weights, vnodes);
};

FixedPositionHashRing.prototype.removeServer = function(server) {
    var mapping = this._getMappingFromServer(server);
    return this.ring.removeServer(mapping);
};

FixedPositionHashRing.prototype.replaceServer = function(oldServer, newServer) {
    var oldMapping = this._getMappingFromServer(oldServer),
        newMapping = this._getMappingFromServer(newServer);

    return this.ring.replaceServer(oldMapping, newMapping);
};

module.exports = FixedPositionHashRing;