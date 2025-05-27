import { Routes, Route } from "react-router";

import { TodoList } from "../pages/todoList";
import { DoThis } from "../pages/doThis";

const ComponentsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<TodoList />} />
      <Route path="/:id" element={<DoThis />} />
    </Routes>
  );
};

export { ComponentsRoutes };
