import "./styles.css";
import { renderDashboard } from "./pages/main.js";

console.log("Javascript Working Correctly.");

// Create Project Object to house the todos 


// Create to do object
class ToDo {
    #id = Math.random().toString(36).substr(2, 9); // Private unique ID
    constructor(title, description, dueDate, priority = 'medium') {
      if (!title || typeof title !== 'string') throw new Error('Title is required and must be a string');
      if (!dueDate || !this.#isValidDate(dueDate)) throw new Error('Invalid due date. Use MM/DD/YYYY');
      if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Priority must be low, medium, or high');
  
      this.title = title;
      this.description = description || 'No description';
      this.dueDate = dueDate;
      this.priority = priority;
    }

    #isValidDate(dateString) {
        const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
        if (!regex.test(dateString)) return false;
        const [month, day, year] = dateString.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return date.getMonth() + 1 === month && date.getDate() === day && date.getFullYear() === year;
      }
    
      getId() {
        return this.#id;
      }
    
      toString() {
        return `${this.title} (Priority: ${this.priority}, Due: ${this.dueDate}) - ${this.description}`;
      }
    }

const toDo1 = new ToDo('50-pushups', 'do 50 push ups in 3 minutes', '06/09/2025', 'high')

console.log(toDo1.description)