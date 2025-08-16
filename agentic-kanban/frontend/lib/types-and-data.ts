// Data Models
export interface Card {
  id: string
  title: string
  description: string
  status: "research" | "in-progress" | "done" | "blocked" | "planned"
  order: number
  createdAt: string // ISO 8601 datetime
  updatedAt: string // ISO 8601 datetime
  tags?: string[]
  completedAt?: string // ISO 8601 datetime (when status = 'done')
}

export interface AgentPolicy {
  id: string
  name: string
  description: string
  rules: string[] // Simple array of strings for mocked rules
}

// Mocked Data
export const mockedGeneratedTasks: Card[] = [
  {
    id: "task-1",
    title: "Research Kanban best practices",
    description: "Explore various Kanban methodologies and tools to inform application design.",
    status: "research",
    order: 1,
    tags: ["kanban", "research", "design"],
    createdAt: "2025-08-16T10:00:00Z",
    updatedAt: "2025-08-16T10:00:00Z",
  },
  {
    id: "task-2",
    title: "Implement chat interface loading state",
    description: "Add a visual loading indicator and setTimeout for agent response simulation.",
    status: "in-progress",
    order: 2,
    tags: ["frontend", "ui", "mocking"],
    createdAt: "2025-08-16T10:05:00Z",
    updatedAt: "2025-08-16T10:05:00Z",
  },
  {
    id: "task-3",
    title: "Design Kanban board layout",
    description: "Create wireframes and mockups for the task management page columns and cards.",
    status: "planned",
    order: 3,
    tags: ["design", "ui", "ux"],
    createdAt: "2025-08-16T10:10:00Z",
    updatedAt: "2025-08-16T10:10:00Z",
  },
  {
    id: "task-4",
    title: "Set up React-Query for task fetching",
    description: "Integrate react-query for efficient data management of tasks from the API.",
    status: "planned",
    order: 4,
    tags: ["frontend", "react-query", "data"],
    createdAt: "2025-08-16T10:15:00Z",
    updatedAt: "2025-08-16T10:15:00Z",
  },
  {
    id: "task-5",
    title: "Develop drag-and-drop functionality",
    description: "Implement interactive drag-and-drop for moving tasks between Kanban columns.",
    status: "blocked",
    order: 5,
    tags: ["frontend", "interaction", "kanban"],
    createdAt: "2025-08-16T10:20:00Z",
    updatedAt: "2025-08-16T10:20:00Z",
  },
  {
    id: "task-6",
    title: "Define initial agent policies",
    description: "Outline basic rules for agent behavior and task generation.",
    status: "research",
    order: 6,
    tags: ["agent", "policy", "backend"],
    createdAt: "2025-08-16T10:25:00Z",
    updatedAt: "2025-08-16T10:25:00Z",
  },
]

export const mockedAgentPolicies: AgentPolicy[] = [
  {
    id: "policy-1",
    name: "Task Prioritization Policy",
    description: "Prioritizes tasks based on urgency and impact, assigning higher order to critical items.",
    rules: [
      "Critical tasks (tag: critical) are prioritized first.",
      "High-impact tasks (tag: high-impact) are prioritized over low-impact tasks.",
      "Tasks with upcoming deadlines are elevated in priority.",
    ],
  },
  {
    id: "policy-2",
    name: "Workflow Automation Policy",
    description: "Automates status updates and notifications based on task completion or blocking.",
    rules: [
      "Automatically move tasks to 'done' when all sub-tasks are completed.",
      "Notify relevant stakeholders when a task moves to 'blocked' status.",
      "Assign new tasks to 'planned' status by default.",
    ],
  },
  {
    id: "policy-3",
    name: "Resource Allocation Policy",
    description: "Suggests optimal resource allocation for tasks based on team availability and skill sets.",
    rules: [
      "Recommend team members with relevant skills for specific task tags.",
      "Distribute tasks evenly among available team members.",
      "Flag tasks requiring specialized skills for review.",
    ],
  },
]
