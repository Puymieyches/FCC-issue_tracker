'use strict';

const Issue = require('../db-schemas').Issue;
const Project = require('../db-schemas').Project;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    
    .post(async function (req, res){
      const projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        let currProject = await Project.findOne({ name: projectName });
        if (!currProject) {
          currProject = new Project({ name: projectName });
          await currProject.save();
        }

        const createIssue = new Issue ({
          projectId: currProject._id,
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to,
          status_text: status_text,
        });

        await createIssue.save();

        res.json(createIssue);

      } catch (err) {
        res.json({ error: "Could not add project: ", err })
      }
    })
  
    .get(async function (req, res){
      const { project: projectName } = req.params;
      const queryFilters = req.query;

      // display all issues under that project name
      try {
        const currProject = await Project.findOne({ name: projectName });
        if (!currProject) {
          return res.json({ error: "project not found" })
        }

        let query = { projectId: currProject._id, ...queryFilters };

        const filteredIssues = await Issue.find(query);
        return res.send(filteredIssues);

      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred while retrieving issues" });
      }
      
    })
    
    .put(async function (req, res){
      const { project: projectName } = req.params;
      const { _id } = req.body;
      // const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      const updateFields = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      delete updateFields._id;

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      try {

        const currProject = await Project.findOne({ name: projectName });
        if (!currProject) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        const result = await Issue.findByIdAndUpdate(
          _id,
          { ...updateFields, updated_on: new Date() },
          { new: true }
        );

        if (!result) {
          return res.json({ error: 'could not update', '_id': _id });
        }
        return res.json({  result: 'successfully updated', '_id': _id });


      } catch (err) {
        console.error(err);
        return res.json({ error: 'could not update', '_id': _id });
      }

    })
    
    .delete(async function (req, res){
      const { project: projectName } = req.params;
      const { _id } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const currProject = await Project.findOne({ name: projectName });

        if (!currProject) {
          return res.json({ error: 'project not found', '_id': _id });
        }

        const { deletedCount } = await Issue.deleteOne({
          _id: _id,
          projectId: currProject._id
        });

        if (deletedCount === 1) {
          return res.json({ result: 'successfully deleted', '_id': _id });
        }
        return res.json({ error: 'could not delete', '_id': _id });     

      } catch (err) {
        console.error(err);
        return res.json({ error: 'could not delete', '_id': _id });
      }

    });
    
};
