import './styles.css';
import ToDoListApp from './app/todo-app.js';
import { renderDashboard } from './pages/dashboard.js';
import { parse } from 'date-fns';

// Initial Data
const app = new ToDoListApp();
app.loadFromLocalStorage(); // Load existing data
if (app.getAllProjects().length === 1 && app.getDefaultProject().getAllToDos().length === 0) {
  // Only initialize sample data if no data exists
  app.createProject('Project A');
  app.addToDoToProject('Design Landing Page', 'Design the landing page', parse('10/25/2025', 'MM/dd/yyyy', new Date()), 'high', 'Project A', 'To-Do');
  app.addToDoToProject('Build API', 'Develop API backend', parse('11/01/2025', 'MM/dd/yyyy', new Date()), 'medium', 'Project A', 'In Progress');
  app.addToDoToProject('Set up Database', 'Configure database', parse('10/20/2025', 'MM/dd/yyyy', new Date()), 'low', 'Project A', 'Completed');
  app.addToDoToProject('Review Content Strategy', 'Review marketing strategy', parse('11/10/2025', 'MM/dd/yyyy', new Date()), 'medium', 'Project A', 'To-Do');
  app.createProject('Project B');
  app.createProject('Project C');
}

document.addEventListener('DOMContentLoaded', () => renderDashboard(app));