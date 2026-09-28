// 画面の描画とユーザー操作の受け付け。状態の変更は TodoCore に任せる。
(function () {
  "use strict";

  var Core = window.TodoCore;
  var STORAGE_KEY = "todo-app.todos";

  var todos = load();
  var filter = currentFilterFromHash();

  var form = document.getElementById("new-todo-form");
  var input = document.getElementById("new-todo");
  var list = document.getElementById("todo-list");
  var toggleAllBox = document.getElementById("toggle-all");
  var footer = document.getElementById("footer");
  var countEl = document.getElementById("count");
  var clearBtn = document.getElementById("clear-completed");
  var filterLinks = document.querySelectorAll("[data-filter]");

  function load() {
    try {
      return Core.parseStored(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      // 保存できない環境（プライベートモード等）でも画面上は動かし続ける。
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function currentFilterFromHash() {
    var name = location.hash.replace(/^#\/?/, "");
    return Core.FILTERS.indexOf(name) >= 0 ? name : "all";
  }

  function update(next) {
    todos = next;
    save();
    render();
  }

  function render() {
    list.innerHTML = "";
    Core.filterTodos(todos, filter).forEach(function (todo) {
      list.appendChild(renderItem(todo));
    });

    var active = Core.countActive(todos);
    countEl.textContent = "残り " + active + " 件";
    footer.hidden = todos.length === 0;
    toggleAllBox.hidden = todos.length === 0;
    toggleAllBox.checked = todos.length > 0 && active === 0;
    clearBtn.hidden = todos.length === active;

    filterLinks.forEach(function (link) {
      link.classList.toggle("selected", link.getAttribute("data-filter") === filter);
    });
  }

  function renderItem(todo) {
    var li = document.createElement("li");
    li.className = "todo" + (todo.completed ? " completed" : "");

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "完了にする");
    checkbox.addEventListener("change", function () {
      update(Core.toggleTodo(todos, todo.id));
    });

    var label = document.createElement("span");
    label.className = "title";
    label.textContent = todo.title;
    label.title = "ダブルクリックで編集";
    label.addEventListener("dblclick", function () {
      startEditing(li, label, todo);
    });

    var del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.textContent = "×";
    del.setAttribute("aria-label", "削除");
    del.addEventListener("click", function () {
      update(Core.removeTodo(todos, todo.id));
    });

    li.append(checkbox, label, del);
    return li;
  }

  function startEditing(li, label, todo) {
    var editor = document.createElement("input");
    editor.className = "edit";
    editor.value = todo.title;
    li.classList.add("editing");
    li.replaceChild(editor, label);
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);

    var done = false;
    function finish(commit) {
      if (done) return;
      done = true;
      if (commit) {
        update(Core.editTodo(todos, todo.id, editor.value));
      } else {
        render();
      }
    }

    editor.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.isComposing) finish(true);
      if (e.key === "Escape") finish(false);
    });
    editor.addEventListener("blur", function () {
      finish(true);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    update(Core.addTodo(todos, input.value, newId()));
    input.value = "";
  });

  toggleAllBox.addEventListener("change", function () {
    update(Core.toggleAll(todos));
  });

  clearBtn.addEventListener("click", function () {
    update(Core.clearCompleted(todos));
  });

  window.addEventListener("hashchange", function () {
    filter = currentFilterFromHash();
    render();
  });

  // 別タブで変更されたら同期する。
  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) {
      todos = load();
      render();
    }
  });

  render();
})();
