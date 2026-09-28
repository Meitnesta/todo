// TODO の状態を操作する純粋な関数群（DOM や localStorage には触れない）。
// ブラウザでは window.TodoCore、Node（テスト）では module.exports として使える。
(function (root) {
  "use strict";

  var FILTERS = ["all", "active", "completed"];

  function normalizeTitle(title) {
    return String(title == null ? "" : title).trim();
  }

  // 空文字（空白のみ含む）のタイトルは追加しない。
  function addTodo(todos, title, id) {
    var t = normalizeTitle(title);
    if (!t) return todos;
    return todos.concat([{ id: id, title: t, completed: false }]);
  }

  function toggleTodo(todos, id) {
    return todos.map(function (todo) {
      return todo.id === id ? Object.assign({}, todo, { completed: !todo.completed }) : todo;
    });
  }

  function removeTodo(todos, id) {
    return todos.filter(function (todo) {
      return todo.id !== id;
    });
  }

  // 編集で空にした場合は削除扱いにする。
  function editTodo(todos, id, title) {
    var t = normalizeTitle(title);
    if (!t) return removeTodo(todos, id);
    return todos.map(function (todo) {
      return todo.id === id ? Object.assign({}, todo, { title: t }) : todo;
    });
  }

  // 1つでも未完了があれば全部完了に、全部完了なら全部未完了に戻す。
  function toggleAll(todos) {
    var allDone = todos.length > 0 && todos.every(function (todo) {
      return todo.completed;
    });
    return todos.map(function (todo) {
      return Object.assign({}, todo, { completed: !allDone });
    });
  }

  function clearCompleted(todos) {
    return todos.filter(function (todo) {
      return !todo.completed;
    });
  }

  function filterTodos(todos, filter) {
    if (filter === "active") return todos.filter(function (todo) { return !todo.completed; });
    if (filter === "completed") return todos.filter(function (todo) { return todo.completed; });
    return todos;
  }

  function countActive(todos) {
    return filterTodos(todos, "active").length;
  }

  // localStorage から読んだ値が壊れていても落ちないように、形を検査して復元する。
  function parseStored(json) {
    try {
      var data = JSON.parse(json);
      if (!Array.isArray(data)) return [];
      return data
        .filter(function (item) {
          return item && typeof item.id === "string" && normalizeTitle(item.title);
        })
        .map(function (item) {
          return { id: item.id, title: normalizeTitle(item.title), completed: item.completed === true };
        });
    } catch (e) {
      return [];
    }
  }

  var api = {
    FILTERS: FILTERS,
    addTodo: addTodo,
    toggleTodo: toggleTodo,
    removeTodo: removeTodo,
    editTodo: editTodo,
    toggleAll: toggleAll,
    clearCompleted: clearCompleted,
    filterTodos: filterTodos,
    countActive: countActive,
    parseStored: parseStored,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TodoCore = api;
  }
})(this);
