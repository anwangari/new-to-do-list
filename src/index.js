import './styles.css'
import ToDoListApp from './app/todo-app.js';
import { renderDashboard } from './pages/dashboard.js';

// Initial Data
const app = new ToDoListApp();

app.createProject('Project A');
app.addToDoToProject('Design Landing Page', 'Design the landing page', '10/25/2025', 'high', 'Default', 'To-Do');
app.addToDoToProject('Build API', 'Develop API backend', '11/01/2025', 'medium', 'Project A', 'In Progress');
app.addToDoToProject('Set up Database', 'Configure database', '10/20/2025', 'low', 'Project A', 'Completed');
app.addToDoToProject('Review Content Strategy', 'Review marketing strategy', '11/10/2025', 'medium', 'Project A', 'To-Do');
app.createProject('Project B');

document.addEventListener('DOMContentLoaded', () => renderDashboard(app));