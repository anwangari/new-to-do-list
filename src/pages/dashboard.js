import { createElement, appendChildren, clearElement } from '../utils/dom-helper.js';
import { parse, format, parseISO } from 'date-fns';

let selectedProjectName = 'Default'; // Default selected project

function showTodoModal(app, mode = 'create', todo = null) {
  const modal = createElement('div', { className: 'modal' });
  const form = createElement('form', { className: 'todo-form' });

  // Create form groups for better organization
  const titleGroup = createElement('div', { className: 'form-group' });
  const titleLabel = createElement('label', { textContent: 'Title:' });
  const titleInput = createElement('input', { 
    type: 'text', 
    placeholder: 'Enter task title', 
    value: todo ? todo.title : '', 
    required: true 
  });
  appendChildren(titleGroup, [titleLabel, titleInput]);

  const descGroup = createElement('div', { className: 'form-group' });
  const descLabel = createElement('label', { textContent: 'Description:' });
  const descInput = createElement('textarea', { 
    placeholder: 'Enter task description (optional)', 
    textContent: todo ? todo.description : '' 
  });
  appendChildren(descGroup, [descLabel, descInput]);

  const dueDateGroup = createElement('div', { className: 'form-group' });
  const dueDateLabel = createElement('label', { textContent: 'Due Date:' });
  const dueDateInput = createElement('input', { 
    type: 'date', 
    value: todo ? format(todo.dueDate, 'yyyy-MM-dd') : '', 
    required: true 
  });
  appendChildren(dueDateGroup, [dueDateLabel, dueDateInput]);

  const priorityGroup = createElement('div', { className: 'form-group' });
  const priorityLabel = createElement('label', { textContent: 'Priority:' });
  const prioritySelect = createElement('select');
  ['low', 'medium', 'high'].forEach(p => {
    const option = createElement('option', { 
      value: p, 
      textContent: p.charAt(0).toUpperCase() + p.slice(1) 
    });
    if (todo && todo.priority === p) option.selected = true;
    prioritySelect.appendChild(option);
  });
  appendChildren(priorityGroup, [priorityLabel, prioritySelect]);

  const statusGroup = createElement('div', { className: 'form-group' });
  const statusLabel = createElement('label', { textContent: 'Status:' });
  const statusSelect = createElement('select');
  ['To-Do', 'In Progress', 'Completed'].forEach(s => {
    const option = createElement('option', { value: s, textContent: s });
    if (todo && todo.status === s) option.selected = true;
    statusSelect.appendChild(option);
  });
  appendChildren(statusGroup, [statusLabel, statusSelect]);

  const projectGroup = createElement('div', { className: 'form-group' });
  const projectLabel = createElement('label', { textContent: 'Project:' });
  const projectSelect = createElement('select');
  app.getAllProjects().forEach(proj => {
    const option = createElement('option', { value: proj.name, textContent: proj.name });
    if ((mode === 'create' && proj.name === selectedProjectName) || 
        (todo && todo.projectName === proj.name)) {
      option.selected = true;
    }
    projectSelect.appendChild(option);
  });
  appendChildren(projectGroup, [projectLabel, projectSelect]);

  const buttonsGroup = createElement('div', { className: 'form-buttons' });
  const submitBtn = createElement('button', { 
    type: 'submit', 
    textContent: mode === 'create' ? 'Create ToDo' : 'Update ToDo' 
  });
  const cancelBtn = createElement('button', { 
    type: 'button', 
    textContent: 'Cancel' 
  });
  appendChildren(buttonsGroup, [submitBtn, cancelBtn]);

  appendChildren(form, [
    titleGroup, descGroup, dueDateGroup, 
    priorityGroup, statusGroup, projectGroup, buttonsGroup
  ]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const newProjectName = projectSelect.value;
      const dueDateValue = parse(dueDateInput.value, 'yyyy-MM-dd', new Date());
      
      if (isNaN(dueDateValue)) {
        alert('Invalid due date');
        return;
      }
      
      if (mode === 'create') {
        app.addToDoToProject(
          titleInput.value, 
          descInput.value, 
          dueDateValue, 
          prioritySelect.value, 
          newProjectName, 
          statusSelect.value
        );
      } else {
        const oldProjectName = todo.projectName;
        todo.updateTitle(titleInput.value);
        todo.updateDescription(descInput.value);
        todo.updateDueDate(dueDateValue);
        todo.updatePriority(prioritySelect.value);
        todo.updateStatus(statusSelect.value);
        
        if (newProjectName !== oldProjectName) {
          app.moveToDo(todo.getId(), oldProjectName, newProjectName);
        } else {
          app.saveToLocalStorage(); // Save changes if no move occurred
        }
      }
      
      document.body.removeChild(modal);
      renderDashboard(app);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  modal.appendChild(form);
  document.body.appendChild(modal);
  
  // Focus the title input
  titleInput.focus();
}

function showProjectModal(app) {
  const modal = createElement('div', { className: 'project-modal' });
  const form = createElement('form', { className: 'project-form' });

  const titleGroup = createElement('div', { className: 'form-group' });
  const titleLabel = createElement('label', { textContent: 'Project Name:' });
  const titleInput = createElement('input', { 
    type: 'text', 
    placeholder: 'Enter project name', 
    required: true 
  });
  appendChildren(titleGroup, [titleLabel, titleInput]);

  const buttonsGroup = createElement('div', { className: 'form-buttons' });
  const submitBtn = createElement('button', { 
    type: 'submit', 
    textContent: 'Create Project' 
  });
  const cancelBtn = createElement('button', { 
    type: 'button', 
    textContent: 'Cancel' 
  });
  appendChildren(buttonsGroup, [submitBtn, cancelBtn]);

  appendChildren(form, [titleGroup, buttonsGroup]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectName = titleInput.value.trim();
    
    if (!projectName) {
      alert('Please enter a project name');
      return;
    }
    
    try {
      app.createProject(projectName);
      selectedProjectName = projectName; // Switch to new project
      document.body.removeChild(modal);
      renderDashboard(app);
    } catch (error) {
      alert(`Error creating project: ${error.message}`);
    }
  });

  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  modal.appendChild(form);
  document.body.appendChild(modal);
  
  // Focus the input
  titleInput.focus();
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
    const projectLink = createElement('a', { 
      textContent: project.name, 
      className: 'project-link'
    });
    
    // Add active state for selected project
    if (project.name === selectedProjectName) {
      projectItem.style.backgroundColor = '#f0f4f8';
      projectLink.style.fontWeight = '600';
    }
    
    const taskCount = createElement('span', { 
      textContent: `${project.getAllToDos().length}`, 
      className: 'task-count' 
    });
    
    const deleteIcon = createElement('span', { 
      textContent: '🗑️', 
      className: 'delete-icon' 
    });

    projectLink.addEventListener('click', (e) => {
      e.preventDefault();
      selectedProjectName = project.name;
      renderDashboard(app);
    });

    deleteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (project.name === 'Default') {
        alert('Cannot delete the default project');
        return;
      }
      
      if (confirm(`Delete project "${project.name}" and all its tasks?`)) {
        const success = app.deleteProject(project.name);
        if (success) {
          if (selectedProjectName === project.name) {
            selectedProjectName = 'Default';
          }
          renderDashboard(app);
        } else {
          alert('Failed to delete project');
        }
      }
    });

    appendChildren(projectItem, [projectLink, taskCount]);
    
    // Only show delete icon for non-default projects
    if (project.name !== 'Default') {
      projectItem.appendChild(deleteIcon);
    }
    
    projectsList.appendChild(projectItem);
  });

  sidebar.appendChild(projectsHeader);
  sidebar.appendChild(projectsList);

  // Main: Project Tasks
  const selectedProject = app.getProject(selectedProjectName) || app.getDefaultProject();
  selectedProjectName = selectedProject.name; // Ensure valid

  const projectHeader = createElement('div', { className: 'project-header' });
  const projectTitle = createElement('h2', { textContent: `${selectedProject.name}` });
  const newTodoBtn = createElement('button', { 
    textContent: '+ New Task', 
    className: 'new-todo-btn' 
  });
  
  newTodoBtn.addEventListener('click', () => {
    showTodoModal(app, 'create');
  });
  
  appendChildren(projectHeader, [projectTitle, newTodoBtn]);

  const tasksContainer = createElement('div', { className: 'tasks-container' });

  const categories = ['To-Do', 'In Progress', 'Completed'];
  categories.forEach(category => {
    const categorySection = createElement('div', { 
      className: `task-category ${category.toLowerCase().replace(' ', '-')}` 
    });
    const categoryTitle = createElement('h3', { textContent: category });
    const tasksList = createElement('ul', { className: 'tasks-list' });

    const categoryTodos = selectedProject.getAllToDos()
      .filter(todo => todo.status === category)
      .sort((a, b) => {
        // Sort by priority (high -> medium -> low) then by due date
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

    if (categoryTodos.length === 0) {
      const emptyMessage = createElement('div', {
        textContent: `No ${category.toLowerCase()} tasks`,
        className: 'empty-message'
      });
      emptyMessage.style.color = '#666';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '20px';
      emptyMessage.style.fontStyle = 'italic';
      tasksList.appendChild(emptyMessage);
    } else {
      categoryTodos.forEach(todo => {
        const taskItem = createElement('li', { 
          className: `task-item ${todo.priority.toLowerCase()}` 
        });
        const taskContent = createElement('div', { className: 'task-content' });
        
        const taskTitle = createElement('div', { 
          textContent: todo.title, 
          className: 'task-title' 
        });
        const taskDue = createElement('div', { 
          textContent: `Due: ${format(todo.dueDate, 'MMM dd, yyyy')}`, 
          className: 'task-due' 
        });
        const taskDesc = createElement('div', { 
          textContent: todo.description || 'No description', 
          className: 'task-desc' 
        });
        
        // Add priority indicator
        const priorityBadge = createElement('span', {
          textContent: todo.priority.toUpperCase(),
          className: 'priority-badge'
        });
        priorityBadge.style.fontSize = '0.7em';
        priorityBadge.style.padding = '2px 6px';
        priorityBadge.style.borderRadius = '10px';
        priorityBadge.style.fontWeight = 'bold';
        priorityBadge.style.marginLeft = '8px';
        
        switch (todo.priority) {
          case 'high':
            priorityBadge.style.backgroundColor = '#fed7d7';
            priorityBadge.style.color = '#c53030';
            break;
          case 'medium':
            priorityBadge.style.backgroundColor = '#feebc8';
            priorityBadge.style.color = '#dd6b20';
            break;
          case 'low':
            priorityBadge.style.backgroundColor = '#c6f6d5';
            priorityBadge.style.color = '#2d7738';
            break;
        }
        
        taskTitle.appendChild(priorityBadge);
        
        appendChildren(taskContent, [taskTitle, taskDue, taskDesc]);

        const deleteIcon = createElement('span', { 
          textContent: '🗑️', 
          className: 'delete-icon' 
        });
        
        deleteIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete task "${todo.title}"?`)) {
            selectedProject.removeToDo(todo.getId());
            app.saveToLocalStorage(); // Save after deletion
            renderDashboard(app);
          }
        });

        taskContent.addEventListener('click', () => {
          showTodoModal(app, 'edit', todo);
        });

        appendChildren(taskItem, [taskContent, deleteIcon]);
        tasksList.appendChild(taskItem);
      });
    }

    appendChildren(categorySection, [categoryTitle, tasksList]);
    tasksContainer.appendChild(categorySection);
  });

  appendChildren(main, [projectHeader, tasksContainer]);
  appendChildren(container, [sidebar, main]);
  content.appendChild(container);

  // Setup navigation event listeners
  setupNavigation(app);
}

function setupNavigation(app) {
  // Remove existing listeners to prevent duplicates
  const dashBtn = document.getElementById('dash');
  const newProjectBtn = document.getElementById('new-project');
  
  // Clone and replace to remove all event listeners
  const newDashBtn = dashBtn.cloneNode(true);
  const newNewProjectBtn = newProjectBtn.cloneNode(true);
  
  dashBtn.parentNode.replaceChild(newDashBtn, dashBtn);
  newProjectBtn.parentNode.replaceChild(newNewProjectBtn, newProjectBtn);
  
  // Add fresh event listeners
  newDashBtn.addEventListener('click', (e) => {
    e.preventDefault();
    renderDashboard(app);
  });
  
  newNewProjectBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showProjectModal(app);
  });
}