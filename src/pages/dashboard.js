import { createElement, appendChildren, clearElement } from '../utils/dom-helper.js';

let selectedProjectName = 'Project A'; // Default selected project

function showTodoModal(app, mode = 'create', todo = null) {
  const modal = createElement('div', { className: 'modal' });
  const form = createElement('form', { className: 'todo-form' });

  const titleInput = createElement('input', { type: 'text', placeholder: 'Title', value: todo ? todo.title : '', required: true });
  const descInput = createElement('textarea', { placeholder: 'Description', textContent: todo ? todo.description : '' });
  const dueDateInput = createElement('input', { type: 'text', placeholder: 'Due Date (MM/DD/YYYY)', value: todo ? todo.dueDate : '', required: true });
  
  const prioritySelect = createElement('select');
  ['low', 'medium', 'high'].forEach(p => {
    const option = createElement('option', { value: p, textContent: p.charAt(0).toUpperCase() + p.slice(1) });
    if (todo && todo.priority === p) option.selected = true;
    prioritySelect.appendChild(option);
  });

  const statusSelect = createElement('select');
  ['To-Do', 'In Progress', 'Completed'].forEach(s => {
    const option = createElement('option', { value: s, textContent: s });
    if (todo && todo.status === s) option.selected = true;
    statusSelect.appendChild(option);
  });

  const projectSelect = createElement('select');
  app.getAllProjects().forEach(proj => {
    const option = createElement('option', { value: proj.name, textContent: proj.name });
    if ((mode === 'create' && proj.name === selectedProjectName) || (todo && todo.projectName === proj.name)) option.selected = true;
    projectSelect.appendChild(option);
  });

  const submitBtn = createElement('button', { type: 'submit', textContent: mode === 'create' ? 'Create ToDo' : 'Update ToDo' });
  const cancelBtn = createElement('button', { type: 'button', textContent: 'Cancel' });

  appendChildren(form, [
    createElement('label', { textContent: 'Title:' }), titleInput,
    createElement('label', { textContent: 'Description:' }), descInput,
    createElement('label', { textContent: 'Due Date:' }), dueDateInput,
    createElement('label', { textContent: 'Priority:' }), prioritySelect,
    createElement('label', { textContent: 'Status:' }), statusSelect,
    createElement('label', { textContent: 'Project:' }), projectSelect,
    submitBtn, cancelBtn
  ]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProjectName = projectSelect.value;
    if (mode === 'create') {
      app.addToDoToProject(titleInput.value, descInput.value, dueDateInput.value, prioritySelect.value, newProjectName, statusSelect.value);
    } else {
      const oldProjectName = todo.projectName;
      todo.updateTitle(titleInput.value);
      todo.updateDescription(descInput.value);
      todo.updateDueDate(dueDateInput.value);
      todo.updatePriority(prioritySelect.value);
      todo.updateStatus(statusSelect.value);
      if (newProjectName !== oldProjectName) {
        app.moveToDo(todo.getId(), oldProjectName, newProjectName);
      }
    }
    document.body.removeChild(modal);
    renderDashboard(app);
  });

  cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

  modal.appendChild(form);
  document.body.appendChild(modal);
}

export function renderDashboard(app) {
  const content = document.getElementById('content');
  clearElement(content);

  const container = createElement('div', { className: 'dashboard-container' });
  const sidebar = createElement('aside', { className: 'sidebar' });
  const main = createElement('main', { className: 'main-content' });

  // Sidebar: Projects
  const projectsHeader = createElement('h2', { textContent: 'Projects' });
  const projectsList = createElement('ul', { className: 'projects-list' });
  app.getAllProjects().forEach(project => {
    const projectItem = createElement('li', { className: 'project-item' });
    const projectLink = createElement('a', { textContent: project.name, className: 'project-link', href: `#${project.name}` });
    const taskCount = createElement('span', { textContent: ` ${project.getAllToDos().length} tasks`, className: 'task-count' });
    const deleteIcon = createElement('span', { textContent: '🗑️', className: 'delete-icon' });

    projectLink.addEventListener('click', (e) => {
      e.preventDefault();
      selectedProjectName = project.name;
      renderDashboard(app);
    });

    deleteIcon.addEventListener('click', () => {
      if (confirm(`Delete project ${project.name}?`)) {
        app.deleteProject(project.name);
        if (selectedProjectName === project.name) selectedProjectName = 'Default';
        renderDashboard(app);
      }
    });

    appendChildren(projectItem, [projectLink, taskCount, deleteIcon]);
    projectsList.appendChild(projectItem);
  });

  sidebar.appendChild(projectsHeader);
  sidebar.appendChild(projectsList);

  // Main: Project Tasks
  const selectedProject = app.getProject(selectedProjectName) || app.getDefaultProject();
  selectedProjectName = selectedProject.name; // Ensure valid
  const projectHeader = createElement('div', { className: 'project-header' });
  const projectTitle = createElement('h2', { textContent: `${selectedProject.name} Tasks` });
  const newTodoBtn = createElement('button', { textContent: 'New ToDo', className: 'new-todo-btn' });
  newTodoBtn.addEventListener('click', () => showTodoModal(app, 'create'));
  appendChildren(projectHeader, [projectTitle, newTodoBtn]);

  const tasksContainer = createElement('div', { className: 'tasks-container' });

  const categories = ['To-Do', 'In Progress', 'Completed'];
  categories.forEach(category => {
    const categorySection = createElement('div', { className: `task-category ${category.toLowerCase().replace(' ', '-')}` });
    const categoryTitle = createElement('h3', { textContent: category });
    const tasksList = createElement('ul', { className: 'tasks-list' });

    selectedProject.getAllToDos()
      .filter(todo => todo.status === category)
      .forEach(todo => {
        const taskItem = createElement('li', { className: `task-item ${todo.priority.toLowerCase()}` });
        const taskContent = createElement('div', { className: 'task-content' });
        const taskTitle = createElement('div', { textContent: todo.title, className: 'task-title' });
        const taskDue = createElement('div', { textContent: `Due: ${todo.dueDate}`, className: 'task-due' });
        const taskDesc = createElement('div', { textContent: todo.description, className: 'task-desc' });
        const taskStatus = createElement('div', { textContent: todo.status === 'Completed' ? `Completed: ${todo.dueDate}` : '', className: 'task-status' });
        appendChildren(taskContent, [taskTitle, taskDue, taskDesc, taskStatus]);

        const deleteIcon = createElement('span', { textContent: '🗑️', className: 'delete-icon' });
        deleteIcon.addEventListener('click', () => {
          if (confirm(`Delete todo "${todo.title}"?`)) {
            selectedProject.removeToDo(todo.getId());
            renderDashboard(app);
          }
        });

        taskContent.addEventListener('click', () => showTodoModal(app, 'edit', todo));

        appendChildren(taskItem, [taskContent, deleteIcon]);
        tasksList.appendChild(taskItem);
      });

    appendChildren(categorySection, [categoryTitle, tasksList]);
    tasksContainer.appendChild(categorySection);
  });

  appendChildren(main, [projectHeader, tasksContainer]);
  appendChildren(container, [sidebar, main]);
  content.appendChild(container);

  // Event Listeners for nav
  document.getElementById('dash').addEventListener('click', () => renderDashboard(app));
  document.getElementById('new-project').addEventListener('click', () => {
    const name = prompt('Enter project name:');
    if (name) app.createProject(name);
    renderDashboard(app);
  });
}