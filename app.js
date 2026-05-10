const MODES = {
  focus: { label: "专注时间", minutes: 25, next: "short" },
  short: { label: "短休息", minutes: 5, next: "focus" },
  long: { label: "长休息", minutes: 15, next: "focus" },
};

const timeDisplay = document.querySelector("#time-display");
const modeLabel = document.querySelector("#mode-label");
const startPauseButton = document.querySelector("#start-pause");
const resetButton = document.querySelector("#reset");
const modeTabs = document.querySelectorAll(".mode-tab");
const progressCircle = document.querySelector(".progress");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const roundCount = document.querySelector("#round-count");
const taskCount = document.querySelector("#task-count");

const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

let activeMode = "focus";
let secondsLeft = MODES.focus.minutes * 60;
let totalSeconds = secondsLeft;
let timerId = null;
let completedFocusRounds = 0;
let tasks = [];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function renderTimer() {
  timeDisplay.textContent = formatTime(secondsLeft);
  modeLabel.textContent = MODES[activeMode].label;
  const elapsed = totalSeconds - secondsLeft;
  const offset = circumference - (elapsed / totalSeconds) * circumference;
  progressCircle.style.strokeDashoffset = offset;
  document.title = `${formatTime(secondsLeft)} · ${MODES[activeMode].label}`;
}

function setMode(mode) {
  activeMode = mode;
  totalSeconds = MODES[mode].minutes * 60;
  secondsLeft = totalSeconds;
  stopTimer();
  modeTabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive.toString());
  });
  renderTimer();
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  startPauseButton.textContent = "开始";
}

function completeCurrentRound() {
  let nextMode = "focus";

  if (activeMode === "focus") {
    completedFocusRounds += 1;
    roundCount.textContent = completedFocusRounds;
    nextMode = completedFocusRounds % 4 === 0 ? "long" : "short";
  }

  setMode(nextMode);
}

function tick() {
  if (secondsLeft <= 0) {
    completeCurrentRound();
    return;
  }
  secondsLeft -= 1;
  renderTimer();
}

function startTimer() {
  if (timerId) {
    stopTimer();
    return;
  }

  startPauseButton.textContent = "暂停";
  timerId = setInterval(tick, 1000);
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = task.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `完成任务：${task.text}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-task";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `删除任务：${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });

  taskCount.textContent = tasks.filter((task) => !task.done).length;
}

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

startPauseButton.addEventListener("click", startTimer);
resetButton.addEventListener("click", () => setMode(activeMode));

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks = [{ id: crypto.randomUUID(), text, done: false }, ...tasks];
  taskInput.value = "";
  renderTasks();
});

renderTimer();
renderTasks();
