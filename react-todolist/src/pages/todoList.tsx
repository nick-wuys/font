import React, { useState, useEffect } from "react";
// import { Link } from "react-router";

import "./index.css";
import { Button } from "../components/styled";

export const TodoList: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [todos, setTodos] = useState<string[]>(["First todo", "Second todo"]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [completedIndexes, setCompletedIndexes] = useState<number[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    addTodo();
  };

  const addTodo = () => {
    if (inputValue.trim() !== "") {
      setTodos([...todos, inputValue]);
      setInputValue("");
    }
  };

  const deleteTodo = (index: number) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const editInput = (index: number) => {
    setEditingIndex(index);
    setEditingValue(todos[index]);
  };

  const onCompleted = (index: number) => {
    if (completedIndexes.includes(index)) {
      setCompletedIndexes(completedIndexes.filter((i) => i !== index));
    } else {
      setCompletedIndexes([...completedIndexes, index]);
    }
  };

  const onEditSubmit = (e: React.FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault();

    const newTodos = [...todos];
    newTodos[editingIndex!] = editingValue;
    setTodos(newTodos);
    setEditingIndex(null);
  };

  return (
    <div className="todo-list">
      <form onSubmit={onSubmit} className="search-form">
        <input
          className="search-input"
          autoComplete="off"
          placeholder="What needs to be done?"
          onChange={onChange}
          value={inputValue}
        />
        <Button.primary>提交</Button.primary>
      </form>
      <ul className="todo-list-items">
        {todos.map((todo, index) => (
          // <Link to={`/${index}`} key={index} className="todo-link">
          <div
            className="todo-list-item"
            onMouseOver={() => setHoverIndex(index)}
            onMouseOut={() => setHoverIndex(-1)}
            onDoubleClick={() => editInput(index)}
          >
            <input
              className="todo-checkbox"
              type="checkbox"
              onChange={() => onCompleted(index)}
            />
            {editingIndex === index ? (
              <form onSubmit={(e) => onEditSubmit(e, index)}>
                <input
                  autoComplete="off"
                  className="search-input edit"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                />
              </form>
            ) : (
              <label
                className={
                  completedIndexes.includes(index)
                    ? "todo-label completed"
                    : "todo-label"
                }
              >
                {todo}
              </label>
            )}
            <Button.delete
              hover={hoverIndex === index}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteTodo(index);
              }}
            >
              X
            </Button.delete>
          </div>
          // </Link>
        ))}
      </ul>
    </div>
  );
};
