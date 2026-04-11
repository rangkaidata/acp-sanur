// The Employee Example

// Employee -> manager
// Employee -> WorkerBee
// WorkerBee -> SalesPerson
// WorkerBee -> Engineer


// A. The Employee object definitions

function Employee () {
  this.name = "";
  this.dept = "general";
}

function Manager () {
  this.reports = [];
}
Manager.prototype=new Employee;

function WorkerBee () {
  this.projects = [];
}
WorkerBee.prototype=new Employee;

function SalesPerson () {
  this.dept = "sales";
  this.quota = 100;
}
SalesPerson.prototype=new WorkerBee;

function Engineer () {
  this.dept = "engineering";
  this.machine = "";
}
Engineer.prototype=new WorkerBee;

// B. Object Properties
// Inheriting Properties


var mark = new WorkerBee;
mark.name = "";
mark.dept = "general";
mark.projects = [];

mark.name = "Doe, Mark";
mark.dept = "admin";
mark.projects = ["navigator"];



