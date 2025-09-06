class ToDo {
  #id = Math.random().toString(36).substr(2, 9);
  constructor(title, description, dueDate, priority = 'medium', projectName, status = 'To-Do') {
    if (!title || typeof title !== 'string') throw new Error('Title is required and must be a string');
    if (!dueDate || !this.#isValidDate(dueDate)) throw new Error('Invalid due date. Use MM/DD/YYYY');
    if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Priority must be low, medium, or high');
    if (!projectName || typeof projectName !== 'string') throw new Error('ToDo must be attached to a project');
    if (!['To-Do', 'In Progress', 'Completed'].includes(status)) throw new Error('Invalid status');

    this.title = title;
    this.description = description || 'No description';
    this.dueDate = dueDate;
    this.priority = priority;
    this.projectName = projectName;
    this.status = status;
  }

  #isValidDate(dateString) {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    if (!regex.test(dateString)) return false;
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() + 1 === month && date.getDate() === day && date.getFullYear() === year;
  }

  getId() { return this.#id; }
  updateProject(projectName) { this.projectName = projectName; }
  updateStatus(status) { 
    if (!['To-Do', 'In Progress', 'Completed'].includes(status)) throw new Error('Invalid status');
    this.status = status; 
  }
  updateTitle(title) {
    if (!title || typeof title !== 'string') throw new Error('Title is required and must be a string');
    this.title = title;
  }
  updateDescription(description) {
    this.description = description || 'No description';
  }
  updateDueDate(dueDate) {
    if (!dueDate || !this.#isValidDate(dueDate)) throw new Error('Invalid due date. Use MM/DD/YYYY');
    this.dueDate = dueDate;
  }
  updatePriority(priority) {
    if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Priority must be low, medium, or high');
    this.priority = priority;
  }
  toString() {
    return `${this.title} (Priority: ${this.priority}, Due: ${this.dueDate}, Status: ${this.status}, Project: ${this.projectName}) - ${this.description}`;
  }
}

class Project {
  #todos = new Map();
  constructor(name) { this.name = name; }
  addToDo(todo) { this.#todos.set(todo.getId(), todo); }
  removeToDo(todoId) { return this.#todos.delete(todoId); }
  getToDo(todoId) { return this.#todos.get(todoId); }
  getAllToDos() { return Array.from(this.#todos.values()); }
  toString() {
    const todos = this.getAllToDos().map(todo => `  - ${todo.toString()}`).join('\n');
    return `Project: ${this.name}\n${todos || '  No to-dos'}`;
  }
}

class ToDoListApp {
  #projects = new Map();
  #defaultProject;

  constructor() {
    this.#defaultProject = new Project('Default');
    this.#projects.set('Default', this.#defaultProject);
  }

  createProject(name) {
    if (this.#projects.has(name)) throw new Error('Project already exists');
    const project = new Project(name);
    this.#projects.set(name, project);
    return project;
  }

  deleteProject(name) { 
    if (name === 'Default') throw new Error('Cannot delete default project'); 
    return this.#projects.delete(name); 
  }
  getProject(name) { return this.#projects.get(name) || null; }
  getDefaultProject() { return this.#defaultProject; }
  getAllProjects() { return Array.from(this.#projects.values()); }

  addToDoToProject(title, description, dueDate, priority, projectName = 'Default', status = 'To-Do') {
    const project = this.#projects.get(projectName);
    if (!project) throw new Error(`Project ${projectName} not found`);
    const todo = new ToDo(title, description, dueDate, priority, projectName, status);
    project.addToDo(todo);
    return todo;
  }

  moveToDo(todoId, fromProjectName, toProjectName = 'Default') {
    const fromProject = this.#projects.get(fromProjectName);
    const toProject = this.#projects.get(toProjectName) || this.#defaultProject;
    if (!fromProject) throw new Error('Source project not found');
    const todo = fromProject.getToDo(todoId);
    if (!todo) throw new Error('ToDo not found');
    fromProject.removeToDo(todoId);
    todo.updateProject(toProject.name);
    toProject.addToDo(todo);
  }

  updateToDoStatus(todoId, projectName, status) {
    const project = this.#projects.get(projectName);
    if (!project) throw new Error('Project not found');
    const todo = project.getToDo(todoId);
    if (!todo) throw new Error('ToDo not found');
    todo.updateStatus(status);
  }

  toString() { return this.getAllProjects().map(project => project.toString()).join('\n\n'); }
}

export default ToDoListApp;