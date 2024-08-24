const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testIssue1;

suite('Functional Tests', function() {
    // POST Tests
    suite('POST api/issues/{project}', function() {
        test('Create an issue with every field', function(done) {
          chai.request(server)
            .post('/api/issues/test')
            .set("content-type", "application/json")
            .send({
                issue_title: "Issue Test Name",
                issue_text: "Issue Test Text Content",
                created_by: "Test God",
                assigned_to: "Test God's Son, Testus",
                status_text: "Second Coming in Progress"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                testIssue1 = res.body;
                assert.equal(res.body.issue_title, 'Issue Test Name');
                assert.equal(res.body.issue_text, 'Issue Test Text Content');
                assert.equal(res.body.created_by, 'Test God');
                assert.equal(res.body.assigned_to, "Test God's Son, Testus");
                assert.equal(res.body.status_text, 'Second Coming in Progress');
                done();
            });
        });
        test('Create an issue with only required fields', function(done) {
          chai.request(server)
            .post('/api/issues/test')
            .set("content-type", "application/json")
            .send({
                issue_title: "Issue Test Name",
                issue_text: "Issue Test Text Content",
                created_by: "Test God",
                assigned_to: "",
                status_text: ""
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.issue_title, 'Issue Test Name');
                assert.equal(res.body.issue_text, 'Issue Test Text Content');
                assert.equal(res.body.created_by, 'Test God');
                assert.equal(res.body.assigned_to, "");
                assert.equal(res.body.status_text, '');
                done();
            });
        });
        test('Create an issue with missing required fields', function(done) {
          chai.request(server)
            .post('/api/issues/test')
            .set("content-type", "application/json")
            .send({
                issue_title: "",
                issue_text: "",
                created_by: "",
                assigned_to: "",
                status_text: ""
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "required field(s) missing")
                done();
            });
        });
    });
    // GET Tests
    suite('GET api/issues/{project}', function() {
        test('View issues on a project', function(done) {
          chai.request(server)
            .get('/api/issues/test')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'Should be an array of Issues for Project');
                assert.property(res.body[0], 'issue_title', 'Issues in array should contain issue_title');
                assert.property(res.body[0], 'issue_text', 'Issues in array should contain issue_text');
                assert.property(res.body[0], 'created_by', 'Issues in array should contain created_by');
                done();
            })
        });
        test('View issues on a project with one filter', function(done) {
          chai.request(server)
            .get('/api/issues/test')
            .query({ open: true })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'Should be an array of Issues for Project');
                res.body.forEach(issue => {
                    assert.equal(issue.open, true, 'All issues should be open');
                });
                done();
            });
        });
        test('View issues on a project with multiple filters', function(done) {
          chai.request(server)
            .get('/api/issues/test')
            .query({ open: true, _id: testIssue1._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'Response should be an array');
                res.body.forEach(issue => {
                    assert.equal(issue.open, true, 'All issues should be open');
                    assert.equal(issue._id, testIssue1._id, 'All issues should have the same project Id');
                });
                done();
            });
        });
    });
    // PUT Tests
    suite('PUT api/issues/{project}', function() {
        test('Update one field on an issue', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testIssue1._id, issue_title: "Issue Test Name Updated" })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, testIssue1._id);
                done();
            });
        });
        test('Update multiple fields on an issue', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: testIssue1._id,
                issue_title: 'Issue Test Name Updated',
                issue_text: 'Issue Test Text Content'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, testIssue1._id);
                done();
            });
        });
        test('Update an issue with missing _id', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({
                issue_title: 'Issue Test Name Updated',
                issue_text: 'Issue Test Text Content'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
        });
        });
        test('Update an issue with no fields to update', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testIssue1._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'no update field(s) sent');
                done();
            });
        });
        test('Update an issue with an invalid _id', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: '63264019943c9b0973351b3a',
                issue_title: 'Issue Test Name Updated'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not update');
                done();
            });
        });
    });
    // DELETE Tests
    suite('DELETE api/issues/{project}', function() {
        test('Delete an issue', function(done) {
          chai.request(server)
            .delete('/api/issues/test')
            .send({ _id: testIssue1._id })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.result, 'successfully deleted');
              done();
            });
        });
        test('Delete an issue with an invalid _id', function(done) {
          chai.request(server)
            .delete('/api/issues/test')
            .send({ _id: "63264019943c9b0973351b3a" })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not delete');
                done();
            });
        });
        test('Delete an issue with missing _id', function(done) {
          chai.request(server)
            .delete('/api/issues/test')
            .send({}) // No _id provided
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
        });
    });
});
