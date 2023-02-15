import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const tasks = database.select('tasks')

      return response.end(JSON.stringify(tasks))
    },
  }, // List all tasks
  {
    method: 'GET',
    path: buildRoutePath('/tasks/filter'),
    handler: (request, response) => {
      const { title, description } = request.query

      const tasks = database.select('tasks', {
        title,
        description,
      })

      return response.end(JSON.stringify(tasks))
    },
  }, // Filter tasks
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body

      if (!title || !description) {
        return response.writeHead(400).end(JSON.stringify({
          error: 'Title and description required.'
        }))
      }

      const [taskAlreadyExists] = database.select('tasks', {
        title,
      })

      if (taskAlreadyExists) {
        return response.writeHead(400).end(JSON.stringify({
          error: 'Task already exists.'
        }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      }

      database.insert('tasks', task)

      return response.writeHead(201).end()
    },
  }, // Create task
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params
      const { title, description } = request.body

      if (!title && !description) {
        return response.writeHead(400).end(JSON.stringify({
          error: 'Title or description required.'
        }))
      }

      const [task] = database.select('tasks', {
        id,
      })

      if (!task) {
        return response.writeHead(404).end(JSON.stringify({
          error: 'Task does not exists.'
        }))
      }

      database.update('tasks', id, {
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: new Date(),
      })

      return response.writeHead(204).end()
    },
  }, // Update task
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params

      const [task] = database.select('tasks', {
        id,
      })

      if (!task) {
        return response.writeHead(404).end(JSON.stringify({
          error: 'Task does not exists.'
        }))
      }

      const isTaskCompleted = !!task.completed_at

      database.update('tasks', id, {
        completed_at: isTaskCompleted ? null : new Date(),
        updated_at: new Date(),
      })

      return response.writeHead(204).end()
    },
  }, // Update complete taks
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params

      const [task] = database.select('tasks', {
        id,
      })

      if (!task) {
        return response.writeHead(404).end(JSON.stringify({
          error: 'Task does not exists.',
        }))
      }

      database.delete('tasks', id)

      return response.writeHead(204).end()
    },
  }, // Delete task
]