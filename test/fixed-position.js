var assert = require('assert')
    HashRing = require('hashring'),
    FixedPositionHashRing = require('../');

function serverPosition(server) {
    return server.split('.')[1];
}

describe('Fixed Position Hashring', function() {
    it('uses hashName to determine position in hash ring', function() {
        var testObj1 = new FixedPositionHashRing({
            "host1.one": {hashName: 'one'},
            "host1.two": {hashName: 'two'}
        });

        var testObj2 = new FixedPositionHashRing({
            "host2.one": {hashName: "one"},
            "host2.two": {hashName: "two"}
        });

        var key = "hello";
        assert.equal(serverPosition(testObj1.getNode(key)), serverPosition(testObj2.getNode(key)));
    });

    it('passes through servers without hashName config', function() {
        var testObj1 = new FixedPositionHashRing(['host1.one', 'host1.two']);
        var testObj2 = new FixedPositionHashRing(['host2.one', 'host2.two']);

        var key = 'hello';
        assert.notEqual(serverPosition(testObj1.getNode(key)), serverPosition(testObj2.getNode(key)));
    });

    it('generates a range of servers based on hashName', function() {
        var testObj1 = new FixedPositionHashRing({
            "host1.one": {hashName: 'one'},
            "host1.two": {hashName: 'two'},
            "host1.three": {hashName: 'three'}
        });

        var testObj2 = new FixedPositionHashRing({
            "host2.one": {hashName: "one"},
            "host2.two": {hashName: "two"},
            "host2.three": {hashName: "three"}
        });

        var key = 'hello';

        var result1 = testObj1.createRange(key, 2);
        var result2 = testObj2.createRange(key, 2);

        assert.deepEqual(result1, ["host1.two", "host1.three"]);
        assert.deepEqual(result2, ["host2.two", "host2.three"]);
    });

    it('removes servers using the hashName', function() {
        var testObj1 = new FixedPositionHashRing({
            "host1.one": {hashName: 'one'},
            "host1.two": {hashName: 'two'}
        });

        var testObj2 = new FixedPositionHashRing({
            "host2.one": {hashName: "one"},
            "host2.two": {hashName: "two"}
        });

        var key = "hello";
        var server1 = testObj1.getNode(key);
        var server2 = testObj2.getNode(key);

        testObj1.removeServer(server1);
        testObj2.removeServer(server2);

        assert.equal(serverPosition(testObj1.getNode(key)), serverPosition(testObj2.getNode(key)));
    });

    it('remembers servers positions', function() {
        var testObj1 = new FixedPositionHashRing({
            "host1.one": {hashName: 'one'},
            "host1.two": {hashName: 'two'}
        });

        var testObj2 = new FixedPositionHashRing({
            "host2.one": {hashName: "one"},
            "host2.two": {hashName: "two"}
        });

        testObj1.removeServer('host1.one');
        testObj2.removeServer('host2.two');

        var key = "hello";
        var server1 = testObj1.getNode(key);
        var server2 = testObj2.getNode(key);

        testObj1.removeServer(server1);
        testObj2.removeServer(server2);

        testObj1.addServer(server1);
        testObj2.addServer(server2);

        assert.equal(testObj1.getNode(key), server1);
        assert.equal(testObj2.getNode(key), server2);
    });
});