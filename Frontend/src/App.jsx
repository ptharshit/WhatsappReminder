import { useState, useEffect } from "react";
import axios from 'axios';

function App() {
  const [reminderMsg, setReminderMsg] = useState(""); // Initialize as an empty string
  const [remindAt, setRemindAt] = useState(""); // Initialize as an empty string
  const [reminderList, setReminderList] = useState([]);
  const [error, setError] = useState(""); // State to hold any errors

  useEffect(() => {
    axios
      .get("http://localhost:5000/getAllReminder")
      .then((res) => setReminderList(res.data))
      .catch((err) => {
        setError("Failed to fetch reminders. Please try again later.");
        console.error(err);
      });
  }, []);

  const addReminder = async () => {
    try {
      const res = await axios.post("http://localhost:5000/addReminder", { reminderMsg, remindAt });
      setReminderList(res.data);
      console.log(res);
      setReminderMsg("");
      setRemindAt("");
    } catch (err) {
      setError("Failed to add reminder. Please check your internet connection and try again.");
      console.error(err);
    }
  };

  // const deleteReminder =async (id)=>{
  //   const res =await axios.post("http://localhost:5000/deleteReminder",{id});
  //   setReminderList(res.data);
  // }
  const deleteReminder = async (id) => {
    try {
      await axios.post("http://localhost:5000/deleteReminder", { id });
      setReminderList(reminderList.filter((reminder) => reminder._id !== id));
    } catch (err) {
      setError("Failed to delete reminder. Please try again later.");
      console.error(err);
    }
  };
  return (
    <div className="bg-zinc-500 min-h-screen  max-w-screen mx-auto">
      <div className=" h-[45%] flex justify-center p-5 lg:p-10 sm:p-5">
        <div className="bg-slate-600 flex flex-col justify-center items-center gap-5 p-9 rounded-lg">
          <h1 className="lg:text-4xl sm:text-xl font-bold text-white">Remind Me 🙋‍♂️</h1>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="text"
            className="p-2 w-full rounded-md"
            placeholder="Reminder notes here..."
            value={reminderMsg}
            onChange={(e) => setReminderMsg(e.target.value)}
          />
          <input
            type="datetime-local"
            className="p-2 w-full rounded-md"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
          />
          <button
            onClick={addReminder}
            className="bg-blue-800 text-white p-3 rounded-xl font-semibold hover:bg-blue-400 hover:text-black"
          >
            Add Reminder
          </button>
        </div>
      </div>

      {reminderList.length > 0 ? (
      <div className="p-2  flex flex-wrap lg:gap-16 md:gap-12 sm:gap-16 lg:justify-start sm:justify-center">
        {/* Render reminderList items dynamically here */}
        {reminderList.map((reminder) => (
          <div
            key={reminder._id}
            className="bg-stone-600 text-white w-fit h-fit flex flex-col gap-2 p-5 text-center rounded-2xl"
          >
            <h2 className="font-semibold text-xl">{reminder.reminderMsg}</h2>
            <h3 className="font-medium">Remind at:</h3>
            <p className=" font-mono">{reminder.remindAt}</p>
            <button onClick={()=>deleteReminder(reminder._id)} className="bg-blue-800 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-400 hover:text-black">
              Delete
            </button>
          </div>
        ))}
      
      </div>
      ):<p>No Reminders yet!</p>}

      <footer className="font-bold bottom-0 text-white absolute w-screen text-center">This is made with ❤️ by Harshit Pachauri</footer>
    </div>
  );
}

export default App;
