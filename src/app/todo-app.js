import { parse, format } from 'date-fns';

class ToDo {
  #id = Math.random().toString(36).substr(2, 9);
  constructor(title, description, dueDate, priority = 'medium', projectName, status = 'To-Do') {
    if (!title || typeof title !== 'string') throw new Error('Title is required and must be a string');
    if (!dueDate || !(dueDate instanceof Date) || isNaN(dueDate)) throw new Error('Invalid due date. Must be a valid Date object');
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
    if (!dueDate || !(dueDate instanceof Date) || isNaN(dueDate)) throw new Error('Invalid due date. Must be a valid Date object');
    this.dueDate = dueDate;
  }
  updatePriority(priority) {
    if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Priority must be low, medium, or high');
    this.priority = priority;
  }
  toJSON() {
    return {
      id: this.#id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate.toISOString(),
      priority: this.priority,
      projectName: this.projectName,
      status: this.status
    };
  }
  static fromJSON(json) {
    return new ToDo(
      json.title,
      json.description,
      parse(json.dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date()),
      json.priority,
      json.projectName,
      json.status
    );
  }
  toString() {
    return `${this.title} (Priority: ${this.priority}, Due: ${format(this.dueDate, 'MM/dd/yyyy')}, Status: ${this.status}, Project: ${this.projectName}) - ${this.description}`;
  }
}

class Project {
  #todos = new Map();
  constructor(name) { this.name = name; }
  addToDo(todo) { this.#todos.set(todo.getId(), todo); }
  removeToDo(todoId) { return this.#todos.delete(todoId); }
  getToDo(todoId) { return this.#todos.get(todoId); }
  getAllToDos() { return Array.from(this.#todos.values()); }
  toJSON() {
    return {
      name: this.name,
      todos: Array.from(this.#todos.values()).map(todo => todo.toJSON())
    };
  }
  static fromJSON(json) {
    const project = new Project(json.name);
    json.todos.forEach(todoJson => project.addToDo(ToDo.fromJSON(todoJson)));
    return project;
  }
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
    this.saveToLocalStorage();
    return project;
  }

  deleteProject(name) { 
    if (name === 'Default') {
      console.warn('Cannot delete default project. Ignoring request.');
      return false; // Return false to indicate failure
    }
    const result = this.#projects.delete(name); 
    this.saveToLocalStorage();
    return result;
  }

  getProject(name) { return this.#projects.get(name) || null; }
  getDefaultProject() { return this.#defaultProject; }
  getAllProjects() { return Array.from(this.#projects.values()); }

  addToDoToProject(title, description, dueDate, priority, projectName = 'Default', status = 'To-Do') {
    const project = this.#projects.get(projectName);
    if (!project) throw new Error(`Project ${projectName} not found`);
    // Accept yyyy-MM-dd format from <input type="date"> and parse it
    let parsedDate;
    if (typeof dueDate === 'string') {
      parsedDate = parse(dueDate, 'yyyy-MM-dd', new Date());
    } else if (dueDate instanceof Date) {
      parsedDate = dueDate;
    } else {
      throw new Error('Invalid due date. Must be a string in yyyy-MM-dd format or a Date object');
    }
    if (isNaN(parsedDate)) throw new Error('Invalid due date format. Use yyyy-MM-dd');
    const todo = new ToDo(title, description, parsedDate, priority, projectName, status);
    project.addToDo(todo);
    this.saveToLocalStorage();
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
    this.saveToLocalStorage();
  }

  updateToDoStatus(todoId, projectName, status) {
    const project = this.#projects.get(projectName);
    if (!project) throw new Error('Project not found');
    const todo = project.getToDo(todoId);
    if (!todo) throw new Error('ToDo not found');
    todo.updateStatus(status);
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    const data = {
      projects: Array.from(this.#projects.entries()).map(([name, project]) => ({ name, todos: project.toJSON().todos }))
    };
    localStorage.setItem('todoAppData', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('todoAppData');
    if (data) {
      const parsedData = JSON.parse(data);
      this.#projects.clear();
      parsedData.projects.forEach(projectData => {
        const project = Project.fromJSON({ name: projectData.name, todos: projectData.todos });
        this.#projects.set(project.name, project);
      });
      this.#defaultProject = this.#projects.get('Default') || new Project('Default');
      if (!this.#projects.has('Default')) this.#projects.set('Default', this.#defaultProject);
    }
  }

  toString() { return this.getAllProjects().map(project => project.toString()).join('\n\n'); }
}

export default ToDoListApp;