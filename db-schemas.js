const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);

const issueSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: ""},
    status_text: { type: String, default: ""},
    open: { type: Boolean, default: true },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
});

const Issue = mongoose.model('Issue', issueSchema);

exports.Issue = Issue;
exports.Project = Project;