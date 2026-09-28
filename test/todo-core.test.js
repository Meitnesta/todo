const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../todo-core.js");

const sample = () => [
  { id: "a", title: "牛乳を買う", completed: false },
  { id: "b", title: "レポート提出", completed: true },
];

test("追加: 前後の空白を除いて末尾に未完了で追加される", () => {
  const result = Core.addTodo([], "  掃除  ", "x");
  assert.deepEqual(result, [{ id: "x", title: "掃除", completed: false }]);
});

test("追加: 空白だけのタイトルは追加されない", () => {
  const todos = sample();
  assert.equal(Core.addTodo(todos, "   ", "x"), todos);
});

test("完了切り替え: 指定した項目だけが反転し、元の配列は変わらない", () => {
  const todos = sample();
  const result = Core.toggleTodo(todos, "a");
  assert.equal(result[0].completed, true);
  assert.equal(result[1].completed, true);
  assert.equal(todos[0].completed, false);
});

test("削除: 指定した項目だけが消える", () => {
  assert.deepEqual(Core.removeTodo(sample(), "a").map((t) => t.id), ["b"]);
});

test("編集: タイトルが更新され、空にすると削除される", () => {
  assert.equal(Core.editTodo(sample(), "a", " 豆乳を買う ")[0].title, "豆乳を買う");
  assert.deepEqual(Core.editTodo(sample(), "a", "  ").map((t) => t.id), ["b"]);
});

test("一括切り替え: 未完了があれば全部完了、全部完了なら全部未完了", () => {
  const allDone = Core.toggleAll(sample());
  assert.ok(allDone.every((t) => t.completed));
  assert.ok(Core.toggleAll(allDone).every((t) => !t.completed));
});

test("完了済みを削除: 未完了だけが残る", () => {
  assert.deepEqual(Core.clearCompleted(sample()).map((t) => t.id), ["a"]);
});

test("絞り込みと残り件数", () => {
  const todos = sample();
  assert.equal(Core.filterTodos(todos, "all").length, 2);
  assert.deepEqual(Core.filterTodos(todos, "active").map((t) => t.id), ["a"]);
  assert.deepEqual(Core.filterTodos(todos, "completed").map((t) => t.id), ["b"]);
  assert.equal(Core.countActive(todos), 1);
});

test("保存データの復元: 壊れたデータでも落ちず、不正な項目は捨てる", () => {
  assert.deepEqual(Core.parseStored(null), []);
  assert.deepEqual(Core.parseStored("{壊れた"), []);
  assert.deepEqual(Core.parseStored('{"a":1}'), []);
  const json = JSON.stringify([
    { id: "a", title: "ok", completed: true },
    { id: 1, title: "idが数値" },
    { id: "c", title: "   " },
    null,
  ]);
  assert.deepEqual(Core.parseStored(json), [{ id: "a", title: "ok", completed: true }]);
});
