
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/colors";

type Priority = "high" | "medium" | "low";
type Filter = "all" | "pending" | "completed";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
};

const STORAGE_KEY = "@taskflow_tasks";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete assignment",
    completed: false,
    priority: "high",
  },
  {
    id: "2",
    title: "Practice React Native",
    completed: false,
    priority: "medium",
  },
  {
    id: "3",
    title: "Review JavaScript",
    completed: true,
    priority: "low",
  },
];

const priorityColors: Record<Priority, string> = {
  high: "#D94F62",
  medium: "#D68A32",
  low: "#4C956C",
};

export default function Dashboard() {
  const theme = Colors.light;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] =
    useState<Priority>("medium");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load saved tasks and fix older tasks without priorities.
  useEffect(() => {
    async function loadTasks() {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
          const parsed: unknown = JSON.parse(savedTasks);

          if (Array.isArray(parsed)) {
            const fixedTasks: Task[] = parsed
              .filter(
                (item): item is Partial<Task> =>
                  item !== null &&
                  typeof item === "object" &&
                  typeof item.title === "string"
              )
              .map((item) => ({
                id:
                  typeof item.id === "string"
                    ? item.id
                    : `${Date.now()}-${Math.random()}`,
                title: item.title ?? "",
                completed: item.completed === true,
                priority:
                  item.priority === "high" ||
                  item.priority === "medium" ||
                  item.priority === "low"
                    ? item.priority
                    : "medium",
              }))
              .filter((task) => task.title.trim() !== "");

            setTasks(fixedTasks);
          } else {
            setTasks(initialTasks);
          }
        } else {
          setTasks(initialTasks);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        setTasks(initialTasks);
      } finally {
        setIsLoaded(true);
      }
    }

    loadTasks();
  }, []);

  // Save tasks whenever they change after loading.
  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(
      (error) => console.error("Error saving tasks:", error)
    );
  }, [tasks, isLoaded]);

  // Add a task using the selected priority.
  function addTask() {
    const title = newTitle.trim();

    if (!title) return;

    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      completed: false,
      priority: newPriority,
    };

    setTasks((current) => [newTask, ...current]);
    setNewTitle("");
    setNewPriority("medium");
  }

  // Toggle task completion.
  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  // Start editing a task.
  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  // Save edited task title.
  function saveEdit() {
    const title = editingTitle.trim();

    if (!title || !editingId) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === editingId ? { ...task, title } : task
      )
    );

    setEditingId(null);
    setEditingTitle("");
  }

  // Update an existing task's priority.
  function changePriority(id: string, priority: Priority) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, priority } : task
      )
    );
  }

  // Delete the selected task.
  function confirmDelete() {
    if (!deleteId) return;

    setTasks((current) =>
      current.filter((task) => task.id !== deleteId)
    );

    setDeleteId(null);
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !task.completed) ||
      (filter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.logo, { color: theme.primary }]}>
              TaskFlow
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Organize your day, your way.
            </Text>
          </View>

          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.secondary },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              TF
            </Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Your tasks, simplified ✨
          </Text>
          <Text style={[styles.welcomeText, { color: theme.muted }]}>
            Small steps make big progress.
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {totalTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>
              Total
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: "#D68A32" }]}>
              {pendingTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>
              Pending
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: theme.success }]}>
              {completedTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>
              Completed
            </Text>
          </View>
        </View>

        {/* Add Task */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Create a new task
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="What do you need to do?"
            placeholderTextColor={theme.muted}
            value={newTitle}
            onChangeText={setNewTitle}
            onSubmitEditing={addTask}
            returnKeyType="done"
            maxLength={150}
          />

          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Select priority
          </Text>

          <View style={styles.priorityRow}>
            {(["high", "medium", "low"] as Priority[]).map(
              (priority) => {
                const selected = newPriority === priority;

                return (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => setNewPriority(priority)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: selected
                          ? `${priorityColors[priority]}18`
                          : theme.input,
                        borderColor: selected
                          ? priorityColors[priority]
                          : theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColors[priority] },
                      ]}
                    />

                    <Text
                      style={[
                        styles.priorityOptionText,
                        {
                          color: selected
                            ? priorityColors[priority]
                            : theme.text,
                        },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={addTask}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Task List Header */}
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            My Tasks
          </Text>
          <Text style={[styles.taskCount, { color: theme.muted }]}>
            {filteredTasks.length} tasks
          </Text>
        </View>

        {/* Search */}
        <TextInput
          style={[
            styles.input,
            styles.searchInput,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="🔍  Search your tasks..."
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["all", "pending", "completed"] as Filter[]).map(
            (item) => {
              const selected = filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: selected
                        ? theme.primary
                        : theme.card,
                      borderColor: selected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: selected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Tasks */}
        {filteredTasks.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: theme.card },
            ]}
          >
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No tasks found
            </Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Add a new task or try a different filter.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                { backgroundColor: theme.card },
                task.completed && { opacity: 0.8 },
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={[
                  styles.checkbox,
                  {
                    borderColor: task.completed
                      ? theme.success
                      : theme.border,
                    backgroundColor: task.completed
                      ? theme.success
                      : "transparent",
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completed }}
              >
                {task.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              <View style={styles.taskDetails}>
                {editingId === task.id ? (
                  <View>
                    <TextInput
                      style={[
                        styles.editInput,
                        {
                          borderColor: theme.border,
                          color: theme.text,
                        },
                      ]}
                      value={editingTitle}
                      onChangeText={setEditingTitle}
                      autoFocus
                      onSubmitEditing={saveEdit}
                      maxLength={150}
                    />

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={saveEdit}
                        style={[
                          styles.smallButton,
                          { backgroundColor: theme.success },
                        ]}
                      >
                        <Text style={styles.smallButtonText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(null);
                          setEditingTitle("");
                        }}
                        style={[
                          styles.smallButton,
                          { backgroundColor: theme.muted },
                        ]}
                      >
                        <Text style={styles.smallButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.taskTitle,
                        { color: theme.text },
                        task.completed && styles.completedTitle,
                      ]}
                    >
                      {task.title}
                    </Text>

                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor:
                              `${priorityColors[task.priority ?? "medium"]}18`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            {
                              color:
                                priorityColors[task.priority ?? "medium"],
                            },
                          ]}
                        >
                          {(task.priority ?? "medium").toUpperCase()}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: task.completed
                              ? theme.success
                              : theme.muted,
                          },
                        ]}
                      >
                        {task.completed ? "Completed" : "Pending"}
                      </Text>
                    </View>

                    {/* Change priority of an existing task */}
                    <View style={styles.existingPriorityRow}>
                      {(["high", "medium", "low"] as Priority[]).map(
                        (priority) => (
                          <TouchableOpacity
                            key={priority}
                            onPress={() =>
                              changePriority(task.id, priority)
                            }
                            style={[
                              styles.miniPriority,
                              {
                                backgroundColor:
                                  task.priority === priority
                                    ? `${priorityColors[priority]}18`
                                    : "transparent",
                                borderColor:
                                  task.priority === priority
                                    ? priorityColors[priority]
                                    : theme.border,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                color:
                                  task.priority === priority
                                    ? priorityColors[priority]
                                    : theme.muted,
                              }}
                            >
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </>
                )}
              </View>

              {editingId !== task.id && (
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    onPress={() => startEdit(task)}
                    style={styles.iconButton}
                    accessibilityLabel="Edit task"
                  >
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDeleteId(task.id)}
                    style={styles.iconButton}
                    accessibilityLabel="Delete task"
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        <Text style={[styles.footer, { color: theme.muted }]}>
          Made with ♥ using TaskFlow
        </Text>
      </ScrollView>

      {/* Delete confirmation dialog */}
      <Modal
        visible={deleteId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Delete this task?
            </Text>

            <Text style={[styles.modalText, { color: theme.muted }]}>
              This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setDeleteId(null)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.secondary },
                ]}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDelete}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.danger },
                ]}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    fontSize: 27,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
  },
  welcome: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#A65A68",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  statNumber: {
    fontSize: 25,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#A65A68",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 17,
    marginBottom: 10,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 12,
  },
  searchInput: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    gap: 10,
    elevation: 1,
    shadowColor: "#A65A68",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkmark: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  taskDetails: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  statusText: {
    fontSize: 11,
  },
  existingPriorityRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
    flexWrap: "wrap",
  },
  miniPriority: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  iconButton: {
    width: 29,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    fontSize: 20,
    color: "#D68A32",
  },
  deleteIcon: {
    fontSize: 17,
    color: "#D94F62",
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: 22,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
  },
  modalText: {
    fontSize: 14,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 24,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
});
