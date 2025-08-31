import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import config from "../config";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingTasks, setUpdatingTasks] = useState(new Set());

  const handleLogout = () => {
    logout();
  };

  // Define getTasks function with useCallback
  const getTasks = useCallback(async () => {
    try {
      const response = await fetch(config.getApiUrl("/api/tasks"), {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks || []);
      } else {
        setError(data.error || "No tasks found");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }, []);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (user) {
      getTasks();
    }
  }, [user, getTasks]);

  const addNewTask = async (e) => {
    e.preventDefault();

    if (!newTask.trim()) {
      setError("Please enter a task");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTask }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setNewTask("");
        getTasks();
      } else {
        setError(data.error || "Failed to add task");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTasks((prev) => new Set(prev).add(taskId));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (response.ok) {
        getTasks(); // Refresh tasks
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update task");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUpdatingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        getTasks(); // Refresh tasks
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete task");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleStatusChange = (taskId, currentStatus) => {
    let newStatus;
    if (currentStatus === "pending") {
      newStatus = "ongoing";
    } else if (currentStatus === "ongoing") {
      newStatus = "completed";
    } else {
      newStatus = "pending";
    }
    updateTaskStatus(taskId, newStatus);
  };

  const getNextStatusText = (currentStatus) => {
    if (currentStatus === "pending") return "Mark as ongoing";
    if (currentStatus === "ongoing") return "Mark as completed";
    return "Mark as pending";
  };

  // Group tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const ongoingTasks = tasks.filter((task) => task.status === "ongoing");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const TaskItem = ({ task }) => {
    const isUpdating = updatingTasks.has(task.id);

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-3 hover:shadow-md transition-all duration-200 hover:border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="relative group flex-shrink-0 mt-0.5">
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <button
                onClick={() => handleStatusChange(task.id, task.status)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  task.status === "completed"
                    ? "bg-green-500 border-green-500 text-white"
                    : task.status === "ongoing"
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 hover:border-blue-400"
                }`}
              >
                {task.status === "completed" && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {task.status === "ongoing" && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )}
            {!isUpdating && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {getNextStatusText(task.status)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex items-center space-x-3">
            <span
              className={`font-medium text-base leading-relaxed ${
                task.status === "completed"
                  ? "line-through text-gray-500"
                  : "text-gray-800"
              }`}
            >
              {task.title}
            </span>
            {task.status === "completed" && task.completed_at && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">
                ✓ Completed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              Delete task
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TaskSection = ({ title, tasks, icon, color }) => (
    <div className="mb-8">
      <h3 className={`text-xl font-bold mb-4 flex items-center ${color}`}>
        {icon && <span className="mr-3">{icon}</span>}
        {title}
        <span className="ml-3 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h3>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium">
                No {title.toLowerCase()} tasks
              </p>
            </div>
          </div>
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );

  // Icons as SVG components
  const ClockIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const PlayIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );

  const CheckIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const WaveIcon = () => (
    <svg
      className="w-8 h-8 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className=" shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Tick Tick Goo
                </h1>
                <p className="text-sm text-gray-500">
                  Organize your tasks efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center space-x-4">
            <WaveIcon />
            <div>
              <h2 className="text-3xl font-bold mb-1">
                Welcome back, {user?.name || "User"}!
              </h2>
              <p className="text-blue-100">Ready to tackle your tasks today?</p>
            </div>
          </div>
        </div>

        {/* Add Task Section */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={addNewTask} className="flex space-x-3">
            <input
              type="text"
              value={newTask}
              onChange={handleInputChange}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Add Task</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tasks Sections */}
        <div className="space-y-8">
          <TaskSection
            title="Pending"
            tasks={pendingTasks}
            icon={<ClockIcon />}
            color="text-orange-600"
          />

          <TaskSection
            title="Ongoing"
            tasks={ongoingTasks}
            icon={<PlayIcon />}
            color="text-blue-600"
          />

          <TaskSection
            title="Completed"
            tasks={completedTasks}
            icon={<CheckIcon />}
            color="text-green-600"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
