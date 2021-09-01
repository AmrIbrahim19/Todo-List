import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
} from "@material-ui/core";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DueDate from "./components/DueDate";
import dayjs from "dayjs";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10, border: "1px solid #bfbfbf" },
  addTodoButton: { marginLeft: 5 },
  filterContainer: { padding: 20, color: "#fff" },
  filterPaper: { backgroundColor: "#0f3242" },
  todosContainer: { marginTop: 10, padding: 20, border: "1px solid #bfbfbf" },
  todoContainer: {
    borderRadius: 5,
    backgroundColor: "#a1cee3",
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [todosToday, setTodosToday] = useState([]);
  const [showToday, setShowToday] = useState(false);
  const [sortSource, setSortSource] = useState(0);
  const [sortDestination, setSortDestination] = useState(0);
  const [deletedIndex, setDeletedIndex] = useState(-1);
  const [recallTodos, setRecallTodos] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/`)
      .then((response) => response.json())
      .then((todoslist) => setTodos(todoslist));
  }, [setTodos, recallTodos]);

  function handleDragEnd(results) {
    const toBeSorted = todos;
    const [sortedTodos] = toBeSorted.splice(results.source.index, 1);
    toBeSorted.splice(results.destination.index, 0, sortedTodos);
    if (results.source.index !== results.destination.index) {
      setSortSource(results.source.index);
      setSortDestination(results.destination.index);
    }
  }

  useEffect(() => {
    if (sortSource !== sortDestination) {
      fetch(`http://localhost:3001/sort/index`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          source: sortSource,
          destination: sortDestination,
        }),
      });
    }
    setSortSource(0);
    setSortDestination(0);
  }, [sortDestination, sortSource]);

  useEffect(() => {
    if (deletedIndex > -1) {
      fetch(`http://localhost:3001/delete/index`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          deletedIndex,
        }),
      }).then(() => setDeletedIndex(-1));
    }
  }, [deletedIndex]);

  function addTodo(text) {
    fetch("http://localhost:3001/", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text, index: todos.length }),
    })
      .then((response) => response.json())
      .then((todo) => setTodos([...todos, todo]));
    setNewTodoText("");
  }

  function toggleTodoCompleted(id) {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !todos.find((todo) => todo.id === id).completed,
      }),
    }).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };
      setTodos(newTodos);
    });
  }

  function deleteTodo(id) {
    const deletedIndex = todos.findIndex((todo) => todo.id === id);
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    })
      .then(() => setTodos(todos.filter((todo) => todo.id !== id)))
      .then(() => setDeletedIndex(deletedIndex));
  }

  useEffect(() => {
    const todayDate = new Date();
    const todayFormatted = dayjs(todayDate).format("MM-DD-YY");
    fetch(`http://localhost:3001/today?date=${todayFormatted}`)
      .then((response) => response.json())
      .then((todayList) => setTodosToday(todayList));
  }, [showToday, recallTodos, todos]);

  function recall() {
    setRecallTodos(!recallTodos);
  }

  function filteredTodos() {
    setShowToday(!showToday);
  }
  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <TextField
              fullWidth
              value={newTodoText}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  addTodo(newTodoText);
                }
              }}
              onChange={(event) => setNewTodoText(event.target.value)}
            />
          </Box>
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>add</Icon>}
            onClick={() => addTodo(newTodoText)}
          >
            Add
          </Button>
        </Box>
      </Paper>
      <Paper className={classes.filterPaper}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          className={classes.filterContainer}
        >
          <Checkbox
            checked={showToday}
            onChange={filteredTodos}
            style={{
              color: "#fff",
            }}
          ></Checkbox>
          <Typography variant="body1">Filter By Todos Of The Day </Typography>
        </Box>
      </Paper>
      {showToday && todosToday.length > 0 && (
        <Paper
          className={classes.todosContainer}
          style={{ maxHeight: "60vh", overflow: "auto" }}
        >
          <Box display="flex" flexDirection="column" alignItems="stretch">
            {todosToday.map(({ id, text, completed, dueDate }) => {
              return (
                <Box
                  key={id}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  className={classes.todoContainer}
                >
                  <Checkbox
                    checked={completed}
                    onChange={() => toggleTodoCompleted(id)}
                  ></Checkbox>
                  <Box flexGrow={1}>
                    <Typography
                      className={completed ? classes.todoTextCompleted : ""}
                      variant="body1"
                    >
                      {text}
                    </Typography>
                  </Box>
                  <Typography variant="body2"> {dueDate}</Typography>
                  <div>
                    <DueDate id={id} recallTodos={recall} />
                  </div>
                  <Button
                    className={classes.deleteTodo}
                    startIcon={<Icon>delete</Icon>}
                    onClick={() => deleteTodo(id)}
                  >
                    Delete
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
      {todos.length > 0 && !showToday && (
        <Paper
          className={classes.todosContainer}
          style={{ maxHeight: "60vh", overflow: "auto" }}
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="items">
              {(provided) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="stretch"
                    >
                      {todos.map(({ id, text, completed, dueDate }, index) => {
                        return (
                          <Draggable key={id} draggableId={id} index={index}>
                            {(provided) => {
                              return (
                                <Box
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                  display="flex"
                                  flexDirection="row"
                                  alignItems="center"
                                  className={classes.todoContainer}
                                >
                                  <Checkbox
                                    checked={completed}
                                    onChange={() => toggleTodoCompleted(id)}
                                  ></Checkbox>
                                  <Box flexGrow={1}>
                                    <Typography
                                      className={
                                        completed
                                          ? classes.todoTextCompleted
                                          : ""
                                      }
                                      variant="body1"
                                    >
                                      {text}
                                    </Typography>
                                  </Box>
                                  {dueDate}
                                  <div>
                                    <DueDate id={id} recallTodos={recall} />
                                  </div>
                                  <Button
                                    className={classes.deleteTodo}
                                    startIcon={<Icon>delete</Icon>}
                                    onClick={() => deleteTodo(id)}
                                  >
                                    Delete
                                  </Button>
                                </Box>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </Box>
                  </div>
                );
              }}
            </Droppable>
          </DragDropContext>
        </Paper>
      )}
    </Container>
  );
}

export default Todos;
