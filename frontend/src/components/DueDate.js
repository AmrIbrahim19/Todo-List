import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Modal, IconButton } from "@material-ui/core";
import Calendar from "react-calendar";
import EventNoteTwoToneIcon from "@material-ui/icons/EventNoteTwoTone";
import dayjs from "dayjs";

const useStyles = makeStyles({
  modal: {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 500,
    maxWidth: 500,
    minHeight: 550,
    maxHeight: 550,
  },
  modalPaper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    border: "2px solid #000",
    minWidth: 500,
    maxWidth: 500,
    minHeight: 550,
    maxHeight: 550,
  },
  simpleDate: {
    fontSize: 30,
  },
  calendar: {
    marginTop: 80,
    minWidth: "70%",
    maxWidth: "70%",
    minHeight: "50%",
    maxHeight: "50%",
    backgroundColor: "#fff",
  },
  submitDateButton: {
    width: "70%",
    marginTop: 50,
    backgroundColor: "#82aec2",
    color: "#fff",
    "&:hover": {
      color: "blue",
      border: "1px solid blue",
    },
  },
});

function DueDate(props) {
  const classes = useStyles();
  const [dueDate, setDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const simpleDate = dueDate.toLocaleDateString();

  const handleOpen = () => {
    setOpenModal(true);
  };
  const handleClose = () => {
    setOpenModal(false);
  };

  function handleDueDate(id, date) {
    const shortDate = dayjs(date).format("MM-DD-YY");
    fetch(`http://localhost:3001/date/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ date: shortDate }),
    })
      .then(() => {
        setOpenModal(false);
      })
      .then(props.recallTodos);
  }

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <EventNoteTwoToneIcon />
      </IconButton>
      <Modal className={classes.modal} open={openModal} onClose={handleClose}>
        <div className={classes.modalPaper}>
          <h2>Set Due Date</h2>
          <h3 className={classes.simpleDate}>{simpleDate}</h3>
          <div className={classes.calendar}>
            <Calendar onChange={setDate} value={dueDate} minDate={new Date()} />
          </div>
          <Button
            className={classes.submitDateButton}
            onClick={() => {
              handleDueDate(props.id, dueDate);
            }}
          >
            Submit Due Date
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export default DueDate;
