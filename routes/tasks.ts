import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Require auth for all task entries
router.use(authMiddleware as any);

// GET /api/tasks
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userTasks = await Task.find({ userId });
    res.json(userTasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving tasks', error: error.message });
  }
});

// POST /api/tasks
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, stage, dueDate, priority } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const validStages = ['Todo', 'In Progress', 'Done'];
    const taskStage = validStages.includes(stage) ? stage : 'Todo';

    const validPriorities = ['Low', 'Medium', 'High'];
    const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';

    const newTask = await Task.create({
      title,
      description: description || '',
      stage: taskStage as 'Todo' | 'In Progress' | 'Done',
      userId,
      dueDate: dueDate || undefined,
      priority: taskPriority as 'Low' | 'Medium' | 'High',
    });

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, description, stage, dueDate, priority } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to task' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null; // allow clearing with null or empty
    if (priority !== undefined) {
      const validPriorities = ['Low', 'Medium', 'High'];
      if (validPriorities.includes(priority)) {
        updateData.priority = priority;
      }
    }
    if (stage !== undefined) {
      const validStages = ['Todo', 'In Progress', 'Done'];
      if (validStages.includes(stage)) {
        updateData.stage = stage;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to task' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully', taskId: id });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

export default router;
