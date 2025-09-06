import { createElement, appendChildren, clearElement } from '../utils/dom-helper.js';

export function renderDashboard(app) {
  const content = document.querySelector('#content');
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
    appendChildren(projectItem, [projectLink, taskCount]);
    projectsList.appendChild(projectItem);
  });

  sidebar.appendChild(projectsHeader);
  sidebar.appendChild(projectsList);

  // Main: Project Tasks
  const selectedProject = app.getProject('Project A') || app.getDefaultProject();
  const projectTitle = createElement('h2', { textContent: `${selectedProject.name} Tasks` });
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
        const taskTitle = createElement('div', { textContent: todo.title, className: 'task-title' });
        const taskDue = createElement('div', { textContent: `Due: ${todo.dueDate}`, className: 'task-due' });
        const taskDesc = createElement('div', { textContent: todo.description, className: 'task-desc' });
        const taskStatus = createElement('div', { textContent: todo.status === 'Completed' ? `Completed: ${todo.dueDate}` : '', className: 'task-status' });
        appendChildren(taskItem, [taskTitle, taskDue, taskDesc, taskStatus]);
        tasksList.appendChild(taskItem);
      });

    appendChildren(categorySection, [categoryTitle, tasksList]);
    tasksContainer.appendChild(categorySection);
  });

  appendChildren(main, [projectTitle, tasksContainer]);
  appendChildren(container, [sidebar, main]);
  content.appendChild(container);

  // Event Listeners
  document.getElementById('dash').addEventListener('click', () => renderDashboard(app));
  document.getElementById('new-project').addEventListener('click', () => {
    const name = prompt('Enter project name:');
    if (name) app.createProject(name);
    renderDashboard(app);
  });
}