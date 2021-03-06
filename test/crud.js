const nforce = require("../");
const should = require("should");
const CONST = require("../lib/constants");
const apiVersion = CONST.API;

const api = require("./mock/sfdc-rest-api");
const port = process.env.PORT || 3000;

var org = nforce.createConnection(api.getClient());

var oauth = api.getOAuth();

describe("api-mock-crud", function() {
  // set up mock server
  before(function(done) {
    api.start(port, done);
  });

  describe("#insert", function() {
    it("should create a proper request on insert", function(done) {
      var obj = nforce.createSObject("Account", {
        Name: "Test Account",
        Test_Field__c: "blah"
      });
      var hs = {
        "sforce-auto-assign": "1"
      };
      org
        .insert({ sobject: obj, oauth: oauth, headers: hs })
        .then(res => {
          should.exist(res);
          var body = JSON.parse(api.getLastRequest().body);
          should.exist(body.name);
          should.exist(body.test_field__c);
          api
            .getLastRequest()
            .url.should.equal(
              "/services/data/" + apiVersion + "/sobjects/account"
            );
          api.getLastRequest().method.should.equal("POST");
          var hKey = Object.keys(hs)[0];
          should.exist(api.getLastRequest().headers[hKey]);
          api.getLastRequest().headers[hKey].should.equal(hs[hKey]);
          done();
        })
        .catch(err => {
          should.not.exist(err);
          done();
        });
    });
  });

  describe("#update", function() {
    it("should create a proper request on update", function(done) {
      var obj = nforce.createSObject("Account", {
        Name: "Test Account",
        Test_Field__c: "blah"
      });
      obj.setId("someid");
      org
        .update({ sobject: obj, oauth: oauth })
        .then(res => {
          should.exist(res);
          api
            .getLastRequest()
            .url.should.equal(
              "/services/data/" + apiVersion + "/sobjects/account/someid"
            );
          api.getLastRequest().method.should.equal("PATCH");
          done();
        })
        .catch(err => {
          should.not.exist(err);
          done();
        });
    });
  });

  describe("#upsert", function() {
    it("should create a proper request on upsert", function(done) {
      var obj = nforce.createSObject("Account", {
        Name: "Test Account",
        Test_Field__c: "blah"
      });
      obj.setExternalId("My_Ext_Id__c", "abc123");
      org
        .upsert({ sobject: obj, oauth: oauth })
        .then(res => {
          should.exist(res);
          var body = JSON.parse(api.getLastRequest().body);
          should.exist(body.name);
          should.exist(body.test_field__c);
          api
            .getLastRequest()
            .url.should.equal(
              "/services/data/" +
                apiVersion +
                "/sobjects/account/my_ext_id__c/abc123"
            );
          api.getLastRequest().method.should.equal("PATCH");
          done();
        })
        .catch(err => {
          should.not.exist(err);
          done();
        });
    });
  });

  describe("#delete", function() {
    it("should create a proper request on delete", function(done) {
      var obj = nforce.createSObject("Account", {
        Name: "Test Account",
        Test_Field__c: "blah"
      });
      obj.setId("someid");
      org
        .delete({ sobject: obj, oauth: oauth })
        .then(res => {
          should.exist(res);
          api
            .getLastRequest()
            .url.should.equal(
              "/services/data/" + apiVersion + "/sobjects/account/someid"
            );
          api.getLastRequest().method.should.equal("DELETE");
          done();
        })
        .catch(err => {
          should.not.exist(err);
          done();
        });
    });
  });

  describe("#apexRest", function() {
    it("should create a proper request for a custom Apex REST endpoint", function(done) {
      org
        .apexRest({ uri: "sample", oauth: oauth })
        .then(res => {
          should.exist(res);
          api.getLastRequest().url.should.equal("/services/apexrest/sample");
          api.getLastRequest().method.should.equal("GET");
          done();
        })
        .catch(err => {
          should.not.exist(err);
          done();
        });
    });
  });

  // reset the lastRequest
  afterEach(function() {
    api.reset();
  });

  // close mock server
  after(function(done) {
    api.stop(done);
  });
});
